# sitecues-certificate-authority

> Create and revoke SSL certificates for Sitecues.

## Why?

 - Secures development infrastructure.
 - Makes it easy to set up HTTPS for new projects.
 - Removes the need to accept certificates for each individual project.

## Usage

Configuration for the certificate authority lives in [config/openssl.conf](https://github.com/sitecues/sitecues-certificate-authority/blob/master/config/openssl.conf). Using this file, you can re-create the root CA or create intermediate CAs. End certificates (such as those for servers) should only ever be created by intermediate CAs, so that the root CA's private key can be used as little as possible and thus best protected.

The root CA's private key is kept offline and managed by SysOps. If you need to create an intermediate CA for your project, ask Seth Holladay about it.

To see the complete steps for creating the root CA all the way down to a server certificate, see [pki.md](https://github.com/sitecues/sitecues-certificate-authority/blob/master/pki.md).

In the future, there will be a server for verifying that you have installed the root certificate.

## License

Copyright © [Sitecues](https://sitecues.com "Owner of sitecues-certificate-authority."). All rights reserved.
