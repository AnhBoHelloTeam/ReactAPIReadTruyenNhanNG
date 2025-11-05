import { buildImageUrl } from '../api/client';

export const getThumbUrl = (thumbPath) => {
  return buildImageUrl(`uploads/comics/${thumbPath}`);
};

export const onImageErrorHide = (e) => {
  if (e?.target) {
    e.target.style.display = 'none';
  }
};


