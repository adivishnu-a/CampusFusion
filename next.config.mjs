/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{ hostname: "images.pexels.com" }, { hostname: "campusfusion.s3.ap-south-1.amazonaws.com" }, { hostname: "undefined.s3.undefined.amazonaws.com" }],
    },
};

export default nextConfig;
