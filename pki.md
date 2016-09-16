# Create a PKI chain

> Root CA => Intermediate CA => Server

Set up the directory structure for the root CA.

```sh
mkdir root-ca;
cd root-ca;
mkdir key cert crl newcert;
chmod 700 key;
touch index.txt;
echo 1000 > serial;
```

Make sure you have a config file for the root CA.
For example [root-ca/openssl.conf](https://github.com/sitecues/sitecues-certificate-authority/blob/master/root-ca/openssl.conf) or [root-config.txt](https://jamielinux.com/docs/openssl-certificate-authority/_downloads/root-config.txt).

```sh
nano openssl.conf;
```

Create a private key for the root CA.

```sh
openssl genrsa -aes256 -out key/root-ca.key 4096;
```

Secure the private key for the root CA.

```sh
chmod 400 key/root-ca.key;
```

Create a self-signed public certificate for the root CA.

```sh
openssl req -config openssl.conf \
      -new -x509 -days 3660 -sha512 -extensions v3_ca \
      -key key/root-ca.key \
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
mkdir ../server-ca;
cd ../server-ca;
mkdir key csr cert crl newcert;
chmod 700 key;
touch index.txt;
echo 1000 > serial;
echo 1000 > crlnumber;
```

Create a config file for the intermediate CA. For example [server-ca/openssl.conf](https://github.com/sitecues/sitecues-certificate-authority/blob/master/server-ca/openssl.conf) or [intermediate-config.txt](https://jamielinux.com/docs/openssl-certificate-authority/_downloads/intermediate-config.txt).

```sh
nano openssl.conf;
```

Create a private key for the intermediate CA.

```sh
openssl genrsa -aes256 -out key/server-ca.key 4096;
```

Secure the private key for the intermediate CA.

```sh
chmod 400 key/server-ca.key;
```

Create a temporary CSR file that will help the root CA create a public certificate for the intermediate CA.

```sh
openssl req -config openssl.conf -new -sha512 \
      -key key/server-ca.key \
      -out csr/server-ca.csr;
```

```sh
cd ../root-ca;
```

Create the intermediate CA's public certificate, based on its CSR.

```sh
openssl ca -config openssl.conf -extensions v3_intermediate_ca \
      -days 2565 -notext -md sha512 \
      -in ../server-ca/csr/server-ca.csr \
      -out ../server-ca/cert/server-ca.cert;
```

Secure the public certificate for the intermediate CA.

```sh
chmod 444 ../server-ca/cert/server-ca.cert;
```

```sh
cd ../server-ca;
```

Check the intermediate CA's public certificate details.

```sh
openssl x509 -noout -text -in cert/server-ca.cert;
```

Verify the integrity of the intermediate CA's public certificate.

```sh
openssl verify -CAfile ../root-ca/cert/root-ca.cert \
      cert/server-ca.cert;
```

Create the intermediate CA's public certificate chain file.

```sh
cat cert/server-ca.cert \
      ../root-ca/cert/root-ca.cert > cert/server-ca-chain.cert;
chmod 444 cert/server-ca-chain.cert;
```

Set up the directory structure for the server.

```sh
mkdir ../server;
cd ../server;
mkdir key csr cert;
chmod 700 key;
```

Create the server's private key. You can avoid adding a password by omitting the "-aes256" flag.

```sh
openssl genrsa -aes256 -out key/localhost.key 4096;
```

Secure the private key for the server.

```sh
chmod 400 key/localhost.key;
```

Create a temporary CSR file that will help the intermediate CA create a public certificate for the server.

```sh
openssl req -config ../server-ca/openssl.conf \
      -key key/localhost.key \
      -new -sha512 -out csr/localhost.csr \
      -subj '/C=US/ST=Massachusetts/L=Cambridge/O=Sitecues/OU=Engineering/CN=localhost/emailAddress=admin@sitecues.com/subjectAltName=DNS.1=localhost,DNS.2=127.0.0.1';
```

```sh
cd ../server-ca;
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
openssl verify -CAfile ../server-ca/cert/server-ca-chain.cert \
      cert/localhost.cert;
```

Create the server's public certificate chain file.

```sh
cat cert/localhost.cert \
      ../server-ca/cert/server-ca.cert > cert/localhost-chain.cert;
chmod 444 cert/localhost-chain.cert;
```
