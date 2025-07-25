import React from 'react';
import { Thumbnail, Box } from '@nimbus-ds/components';
import { IImage } from '../../products.types';

interface ProductThumbnailProps {
  productName: string;
  images?: IImage[] | null;
  width?: string;
  height?: string;
}

const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  productName,
  images,
  width = "36px",
  height = "36px"
}) => {
  const hasImage = images && Array.isArray(images) && images.length > 0 && images[0]?.src;

  if (hasImage) {
    return (
      <Thumbnail
        src={images[0].src}
        width={width}
        height={height}
        alt={productName}
      />
    );
  }

  return (
    <Box 
      width={width} 
      height={height} 
      backgroundColor="neutral-background"
      borderRadius="1"
    />
  );
};

export default ProductThumbnail;
