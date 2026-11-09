/** @type {import('next').NextConfig} */
const nextConfig = {
  // gRPC and the Walrus Memory SDK run on the server only.
  serverExternalPackages: ['@grpc/grpc-js', '@protobuf-ts/grpc-transport', '@mysten-incubation/memwal'],
};

export default nextConfig;
