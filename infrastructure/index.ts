import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const bucketNameAndUrl = config.require("bucket");

// Create a bucket and expose a website index document
const bucket = new aws.s3.Bucket(
  bucketNameAndUrl,
  {
    arn: `arn:aws:s3:::${bucketNameAndUrl}`,
    bucket: bucketNameAndUrl,
    requestPayer: "BucketOwner",
    serverSideEncryptionConfiguration: {
      rule: {
        applyServerSideEncryptionByDefault: {
          sseAlgorithm: "AES256",
        },
      },
    },
    versioning: {
      enabled: true,
    },
    website: {
      errorDocument: "index.html",
      indexDocument: "index.html",
    },
  },
  {
    protect: true,
  },
);

const publicAccessBlock = new aws.s3.BucketPublicAccessBlock(
  `${bucketNameAndUrl}-public-access-block`,
  {
    bucket: bucket.id,
    blockPublicAcls: false,
  },
);

const bucketPolicy = new aws.s3.BucketPolicy(
  `${bucketNameAndUrl}-bucket-policy`,
  {
    bucket: bucket.id, // refer to the bucket created earlier
    policy: pulumi.jsonStringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [pulumi.interpolate`${bucket.arn}/*`],
        },
      ],
    }),
  },
  { dependsOn: publicAccessBlock },
);

const bucketOwnershipControls = new aws.s3.BucketOwnershipControls(
  `${bucketNameAndUrl}-ownership-controls`,
  {
    bucket: bucket.id,
    rule: {
      objectOwnership: "ObjectWriter",
    },
  },
);

const distribution = new aws.cloudfront.Distribution(
  `${bucketNameAndUrl}-distribution`,
  {
    aliases: [bucketNameAndUrl],
    defaultCacheBehavior: {
      allowedMethods: ["GET", "HEAD"],
      cachedMethods: ["GET", "HEAD"],
      compress: true,
      defaultTtl: 31536000,
      forwardedValues: {
        cookies: {
          forward: "none",
        },
        queryString: false,
      },
      maxTtl: 31536000,
      minTtl: 31536000,
      targetOriginId: `S3-Website-${bucketNameAndUrl}.s3-website-us-west-2.amazonaws.com`,
      viewerProtocolPolicy: "redirect-to-https",
    },
    defaultRootObject: "index.html",
    enabled: true,
    isIpv6Enabled: true,
    origins: [
      {
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: "http-only",
          originSslProtocols: ["TLSv1", "TLSv1.1", "TLSv1.2"],
        },
        domainName: bucket.websiteEndpoint,
        originId: `S3-Website-${bucketNameAndUrl}.s3-website-us-west-2.amazonaws.com`,
      },
    ],
    restrictions: {
      geoRestriction: {
        restrictionType: "none",
      },
    },
    viewerCertificate: {
      acmCertificateArn: config.get("certificateArn"),
      minimumProtocolVersion: "TLSv1.2_2021",
      sslSupportMethod: "sni-only",
    },
  },
  {
    protect: true,
  },
);

const cNameRecord = new aws.route53.Record(
  `${bucketNameAndUrl}-cname-record`,
  {
    name: bucketNameAndUrl,
    records: [distribution.domainName.apply((t) => t)],
    ttl: 3600,
    type: aws.route53.RecordType.CNAME,
    zoneId: config.require("zoneId"),
  },
  {
    protect: true,
  },
);

// Create Cognito User Pool for authentication
const userPool = new aws.cognito.UserPool(`${bucketNameAndUrl}-user-pool`, {
  name: `${bucketNameAndUrl}-user-pool`,
  autoVerifiedAttributes: ["email"],
  usernameAttributes: ["email"],
  passwordPolicy: {
    minimumLength: 8,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    requireUppercase: true,
    temporaryPasswordValidityDays: 7,
  },
  emailConfiguration: {
    emailSendingAccount: "COGNITO_DEFAULT",
  },
  verificationMessageTemplate: {
    defaultEmailOption: "CONFIRM_WITH_CODE",
    emailMessage: "Your verification code is {####}",
    emailSubject: "Verify your email",
  },
  accountRecoverySetting: {
    recoveryMechanisms: [
      {
        name: "verified_email",
        priority: 1,
      },
    ],
  },
});

// Create Cognito User Pool Client
const userPoolClient = new aws.cognito.UserPoolClient(
  `${bucketNameAndUrl}-user-pool-client`,
  {
    name: `${bucketNameAndUrl}-user-pool-client`,
    userPoolId: userPool.id,
    generateSecret: false,
    explicitAuthFlows: [
      "ALLOW_REFRESH_TOKEN_AUTH",
      "ALLOW_USER_PASSWORD_AUTH",
      "ALLOW_USER_SRP_AUTH",
    ],
    preventUserExistenceErrors: "ENABLED",
    enableTokenRevocation: true,
    authSessionValidity: 3,
    accessTokenValidity: 60,
    idTokenValidity: 60,
    refreshTokenValidity: 30,
    tokenValidityUnits: {
      accessToken: "minutes",
      idToken: "minutes",
      refreshToken: "days",
    },
    readAttributes: ["email", "email_verified", "name"],
    writeAttributes: ["email", "name"],
  },
);

export const bucketUrn = bucket.urn;
export const s3BucketUri = pulumi.interpolate`s3://${bucket.bucket}`;
export const publicAccessBlockUrn = publicAccessBlock.urn;
export const bucketPolicyUrn = bucketPolicy.urn;
export const exampleBucketOwnershipControlsUrn = bucketOwnershipControls.urn;
export const distributionUrn = distribution.urn;
export const distributionId = distribution.id;
export const cNameRecordUrn = cNameRecord.urn;
export const userPoolId = userPool.id;
export const userPoolClientId = userPoolClient.id;
