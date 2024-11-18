import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

async function optimizeImage(
  imageUrl: string,
  width: number = 64,
  height: number = 64,
) {
  try {
    // Create a remote image metadata object
    const remoteSrc = {
      src: imageUrl,
      width: width,
      height: height,
      format: "webp" as const,
    } as ImageMetadata;

    // Get optimized image using Astro's image service
    const optimized = await getImage({
      src: remoteSrc,
      width: width,
      height: height,
      format: "webp",
    });

    return optimized;
  } catch (error) {
    console.error(`Failed to optimize image: ${imageUrl}`, error);
    return null;
  }
}

export default async function processItem(item: any) {
  if (item.icon) {
    const optimizedImage = await optimizeImage(item.icon);
    if (optimizedImage) {
      return {
        ...item,
        icon: optimizedImage.src,
        iconSrcset: optimizedImage.srcSet,
        iconAttributes: {
          width: optimizedImage.attributes.width,
          height: optimizedImage.attributes.height,
          loading: "lazy",
          decoding: "async",
        },
      };
    }
  }
  return item;
}
