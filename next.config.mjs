/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: false,
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        unoptimized: true
    }
};

export default nextConfig;
