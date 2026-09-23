import { App, CfnOutput, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { CfnBucket, CfnBucketPolicy } from "aws-cdk-lib/aws-s3";
import { CfnDistribution } from "aws-cdk-lib/aws-cloudfront";
import { CfnRecordSet } from "aws-cdk-lib/aws-route53";
import { Construct } from "constructs";
import { EnvConfig } from "./config";

export class GeoJournalWebStack extends Stack {
  constructor(scope: App, id: string, cfg: EnvConfig, props: StackProps) {
    super(scope, id, props);

    const originId = `S3-Website-${cfg.bucketName}.s3-website-${cfg.region}.amazonaws.com`;

    const bucket = new CfnBucket(this, "Bucket", {
      bucketName: cfg.bucketName,
      versioningConfiguration: {
        status: "Enabled",
      },
      bucketEncryption: {
        serverSideEncryptionConfiguration: [
          {
            serverSideEncryptionByDefault: {
              sseAlgorithm: "AES256",
            },
          },
        ],
      },
      websiteConfiguration: {
        indexDocument: "index.html",
        errorDocument: "index.html",
      },
      ownershipControls: {
        rules: [{ objectOwnership: "ObjectWriter" }],
      },
      publicAccessBlockConfiguration: {
        blockPublicAcls: false,
        ignorePublicAcls: false,
        blockPublicPolicy: false,
        restrictPublicBuckets: false,
      },
    });
    bucket.applyRemovalPolicy(RemovalPolicy.RETAIN);

    const bucketPolicy = new CfnBucketPolicy(this, "BucketPolicy", {
      bucket: bucket.ref,
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${cfg.bucketName}/*`],
          },
        ],
      },
    });
    bucketPolicy.addDependency(bucket);

    const distribution = new CfnDistribution(this, "Distribution", {
      distributionConfig: {
        enabled: true,
        aliases: [cfg.bucketName],
        defaultRootObject: "index.html",
        ipv6Enabled: true,
        comment: "",
        priceClass: "PriceClass_All",
        httpVersion: "http2",
        origins: [
          {
            id: originId,
            domainName: `${cfg.bucketName}.s3-website-${cfg.region}.amazonaws.com`,
            customOriginConfig: {
              httpPort: 80,
              httpsPort: 443,
              originProtocolPolicy: "http-only",
              originSslProtocols: ["TLSv1", "TLSv1.1", "TLSv1.2"],
            },
          },
        ],
        defaultCacheBehavior: {
          targetOriginId: originId,
          viewerProtocolPolicy: "redirect-to-https",
          allowedMethods: ["GET", "HEAD"],
          cachedMethods: ["GET", "HEAD"],
          compress: true,
          minTtl: 31536000,
          defaultTtl: 31536000,
          maxTtl: 31536000,
          forwardedValues: {
            queryString: false,
            cookies: {
              forward: "none",
            },
          },
        },
        restrictions: {
          geoRestriction: {
            restrictionType: "none",
          },
        },
        viewerCertificate: {
          acmCertificateArn: cfg.certificateArn,
          sslSupportMethod: "sni-only",
          minimumProtocolVersion: "TLSv1.2_2021",
        },
      },
    });
    distribution.applyRemovalPolicy(RemovalPolicy.RETAIN);
    distribution.addDependency(bucket);

    const cnameRecord = new CfnRecordSet(this, "CNameRecord", {
      name: cfg.bucketName,
      type: "CNAME",
      hostedZoneId: cfg.zoneId,
      ttl: "3600",
      resourceRecords: [distribution.attrDomainName],
    });
    cnameRecord.applyRemovalPolicy(RemovalPolicy.RETAIN);
    cnameRecord.addDependency(distribution);

    new CfnOutput(this, "DistributionId", { value: distribution.ref });
    new CfnOutput(this, "S3BucketUri", { value: `s3://${cfg.bucketName}` });
    new CfnOutput(this, "UserPoolId", { value: cfg.userPoolId });
    new CfnOutput(this, "UserPoolClientId", { value: cfg.userPoolClientId });
    new CfnOutput(this, "ApiUrl", { value: cfg.apiUrl });
  }
}
