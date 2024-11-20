import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

async function optimizeImage(
  imageUrl: string,
  width: number = 64,
  height: number = 64,
) {
  try {
    const remoteSrc = {
      src: imageUrl,
      width: width,
      height: height,
      format: "webp" as const,
    } as ImageMetadata;

    const optimized = await getImage({
      src: remoteSrc,
      width: width,
      height: height,
      format: "webp",
    });

    return {
      src: optimized.src,
      srcSet: optimized.srcSet,
      width: optimized.attributes.width,
      height: optimized.attributes.height,
    };
  } catch (error) {
    console.error(`Failed to optimize image: ${imageUrl}`, error);
    return null;
  }
}

export default async function processItem(item: any) {
  let optimizedItem = item;
  if (item.icon) {
    const optimizedImage = await optimizeImage(item.icon);
    if (optimizedImage) {
      optimizedItem = {
        ...item,
        icon: optimizedImage.src,
        iconSrcset: optimizedImage.srcSet,
        iconAttributes: {
          width: optimizedImage.width,
          height: optimizedImage.height,
          loading: "lazy",
          decoding: "async",
        },
      };
    }
  }
  if (item.banner) {
    const optimizedImage = await optimizeImage(item.banner);
    if (optimizedImage) {
      optimizedItem = {
        ...optimizedItem,
        banner: optimizedImage.src,
        bannerSrcset: optimizedImage.srcSet,
        bannerAttributes: {
          width: optimizedImage.width,
          height: optimizedImage.height,
          loading: "lazy",
          decoding: "async",
        },
      };
    }
  }
  return optimizedItem;
}
