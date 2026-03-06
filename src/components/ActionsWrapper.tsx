interface Props {
  children?: React.ReactNode;
}

export default function ActionsWrapper({ children }: Props) {
  return (
    <div className="flex flex-wrap items-center md:justify-end gap-2">
      {children}
    </div>
  );
}
