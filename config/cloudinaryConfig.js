import cloudinary from "cloudinary";

export const configCloudinary = () =>
  cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
  });

export const uploadToCloudinary = async (fileUri, folder) => {
  try {
    const data = await cloudinary.v2.uploader.upload(fileUri, { folder });
    return { url: data.url, public_id: data.public_id };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const removeFromCloudinary = async (public_id) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(public_id);
    console.log(result);
  } catch (error) {
    console.error(error);
    throw error;
  }
};
