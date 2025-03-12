/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{ hostname: "images.pexels.com" }, { hostname: "campusfusion.s3.ap-south-1.amazonaws.com" }],
    },
};

export default nextConfig;
