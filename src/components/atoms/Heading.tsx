type HeadingProps = { text: string };

export const Heading = ({ text }: HeadingProps) => {
  return <h2 className="text-2xl font-bold mb-4">{text}</h2>;
};
