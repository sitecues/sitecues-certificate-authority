# Create a PKI chain

> Root CA => Intermediate CA => Server

Set up the directory structure for the root CA.

```sh
mkdir root-ca;
cd root-ca;
mkdir private cert crl newcert;
chmod 700 private;
touch index.txt;
echo 1000 > serial;
```

Make sure you have a config file for the root CA.
For example [config/openssl.conf](https://bitbucket.org/ai_squared/sitecues-certificate-authority/src/master/config/openssl.conf) or [root-config.txt](https://jamielinux.com/docs/openssl-certificate-authority/_downloads/root-config.txt).

```sh
nano openssl.conf;
```

Create a private key for the root CA.

```sh
openssl genrsa -aes256 -out private/root-ca.key 4096;
```

Secure the private key for the root CA.

```sh
chmod 400 private/root-ca.key;
```

Create a self-signed public certificate for the root CA.

```sh
openssl req -config openssl.conf \
      -new -x509 -days 3660 -sha512 -extensions v3_ca \
      -key private/root-ca.key \
      -out cert/root-ca.cert;
```

Secure the public certificate for the root CA.

```sh
chmod 444 cert/root-ca.cert;
```

Check the root CA's public certificate details.

```sh
openssl x509 -noout -text -in cert/root-ca.cert;
```

Set up the directory structure for the intermediate CA.

```sh
mkdir ../intermediate-ca;
cd ../intermediate-ca;
mkdir private csr cert crl newcert;
chmod 700 private;
touch index.txt;
echo 1000 > serial;
echo 1000 > crlnumber;
```

Create a config file for the intermediate CA. For example:
https://jamielinux.com/docs/openssl-certificate-authority/_downloads/intermediate-config.txt

```sh
nano openssl.conf;
```

Create a private key for the intermediate CA.

```sh
openssl genrsa -aes256 -out private/intermediate-ca.key 4096;
```

Secure the private key for the intermediate CA.

```sh
chmod 400 private/intermediate-ca.key;
```

Create a temporary CSR file that will help the root CA create a public certificate for the intermediate CA.

```sh
openssl req -config openssl.conf -new -sha512 \
      -key private/intermediate-ca.key \
      -out csr/intermediate-ca.csr;
```

```sh
cd ../root-ca;
```

Create the intermediate CA's public certificate, based on its CSR.

```sh
openssl ca -config openssl.conf -extensions v3_intermediate_ca \
      -days 2565 -notext -md sha512 \
      -in ../intermediate-ca/csr/intermediate-ca.csr \
      -out ../intermediate-ca/cert/intermediate-ca.cert;
```

Secure the public certificate for the intermediate CA.

```sh
chmod 444 ../intermediate-ca/cert/intermediate-ca.cert;
```

```sh
cd ../intermediate-ca;
```

Check the intermediate CA's public certificate details.

```sh
openssl x509 -noout -text -in cert/intermediate-ca.cert;
```

Verify the integrity of the intermediate CA's public certificate.

```sh
openssl verify -CAfile ../root-ca/cert/root-ca.cert \
      cert/intermediate-ca.cert;
```

Create the intermediate CA's public certificate chain file.

```sh
cat cert/intermediate-ca.cert \
      ../root-ca/cert/root-ca.cert > cert/ca-chain.cert;
chmod 444 cert/ca-chain.cert;
```

Set up the directory structure for the server.

```sh
mkdir ../server;
cd ../server;
mkdir private csr cert;
chmod 700 private;
```

Create the server's private key. You can avoid adding a password by omitting the "-aes256" flag.

```sh
openssl genrsa -aes256 -out private/localhost.key 4096;
```

Secure the private key for the server.

```sh
chmod 400 private/localhost.key;
```

Create a temporary CSR file that will help the intermediate CA create a public certificate for the server.

```sh
openssl req -config ../intermediate-ca/openssl.conf \
      -key private/localhost.key \
      -new -sha512 -out csr/localhost.csr \
      -subj '/C=US/ST=Massachusetts/L=Cambridge/O=Sitecues/OU=Engineering/CN=localhost/emailAddress=admin@sitecues.com/subjectAltName=DNS.1=localhost,DNS.2=127.0.0.1';
```

```sh
cd ../intermediate-ca;
```

Create the server's public certificate, based on its CSR.

```sh
openssl ca -config openssl.conf \
      -extensions server_cert -days 1105 -notext -md sha512 \
      -in ../server/csr/localhost.csr \
      -out ../server/cert/localhost.cert;
```

Secure the public certificate for the server.

```sh
chmod 444 ../server/cert/localhost.cert;
```

```sh
cd ../server;
```

Check the server's public certificate details.

```sh
openssl x509 -noout -text -in cert/localhost.cert;
```

Verify the integrity of the server's public certificate.

```sh
openssl verify -CAfile ../intermediate-ca/cert/ca-chain.cert \
      cert/localhost.cert;
```
