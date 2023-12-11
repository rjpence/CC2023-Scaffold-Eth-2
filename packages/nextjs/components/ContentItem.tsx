import Image from "next/image";
import { contentItemImageData } from "./contentItemImageData";

/**
 * Displays content items
 */
export interface ContentItemImageData {
  src: string;
  alt: string;
  credit: string;
  width: number;
  height: number;
}

interface ContentItemProps {
  title: string;
  description: string;
  url: string;
  onClick: () => void;
}

function getRandomContenItemImage(): ContentItemImageData {
  const data = contentItemImageData;
  if (data.length === 0) {
    throw new Error("Array is empty");
  }
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

export const ContentItem = (props: ContentItemProps) => {
  const { title, description, url, onClick } = props;
  const imageData = getRandomContenItemImage();
  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    window.open(url, "_blank");
    onClick();
  };
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <figure>
        <Image
          src={imageData.src}
          width={imageData.width}
          height={imageData.height}
          alt={imageData.alt}
          sizes="100vw"
          style={{ width: "100%", height: "auto" }}
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{title}</h2>
        {description && <p>{description}</p>}
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={handleButtonClick}>
            Read to Earn
          </button>
        </div>
      </div>
    </div>
  );
};
