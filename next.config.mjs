/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false, 
    async redirects() {
        return [
            {
                source: "/",
                destination: "/login",
                permanent: true,
            },
        ];
    },
    typescript: {
        ignoreBuildErrors: true
    }
};

export default nextConfig;
