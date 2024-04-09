/** @type {import('next').NextConfig} */
const nextConfig = {
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
