import Image from 'next/image';
import { IMAGE_BLUR, IMAGE_DEFAULT_URL } from '@/public/constant';

const ImageLoader = ({ imageUrl, altText }) => {
  return (
    <>
      <Image
        src={imageUrl || IMAGE_DEFAULT_URL}
        alt={altText}
        width={100} // Replace with your desired width
        height={100} // Replace with your desired height
        placeholder="blur"
        blurDataURL={IMAGE_BLUR}
        title={altText}
      />
    </>
  );
};

export default ImageLoader;
