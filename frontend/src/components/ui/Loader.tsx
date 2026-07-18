type BadgeProps = {
  text: string;
};

function Badge({ text }: BadgeProps) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
      {text}
    </span>
  );
}

export default Badge;