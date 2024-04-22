/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    reactStrictMode: false,
<<<<<<< HEAD
    async redirects() {
        return [
            {
                source: "/",
                destination: "/login",
                permanent: true,
            },
        ];
    },
=======
>>>>>>> a60c1327d93167af7473f70f527fa90c06266716
    typescript: {
        ignoreBuildErrors: true
    },
    images: {
        unoptimized: true
    }
};

export default nextConfig;
