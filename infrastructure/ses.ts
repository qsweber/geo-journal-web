import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const domain = config.require("bucket");
const zoneId = config.require("zoneId");

// SES domain identity
const domainIdentity = new aws.ses.DomainIdentity(
  `${domain}-ses-domain-identity`,
  {
    domain: domain,
  },
);

// Verification TXT record for SES
new aws.route53.Record(`${domain}-ses-domain-verification`, {
  name: `_amazonses.${domain}`,
  type: "TXT",
  zoneId: zoneId,
  ttl: 300,
  records: [domainIdentity.verificationToken],
});

// DKIM records
const dkim = new aws.ses.DomainDkim(`${domain}-ses-domain-dkim`, {
  domain: domain,
});

for (let i = 0; i < 3; i++) {
  const token = dkim.dkimTokens[i];
  new aws.route53.Record(`${domain}-ses-dkim-${i}`, {
    name: pulumi.interpolate`${token}._domainkey.${domain}`,
    type: "CNAME",
    zoneId: zoneId,
    ttl: 300,
    records: [pulumi.interpolate`${token}.dkim.amazonses.com`],
  });
}

export { domainIdentity };
