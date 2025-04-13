import { ButtonHTMLAttributes } from "react";

export default function PrimaryButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className="rounded-md bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:cursor-pointer hover:bg-blue-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500"
      {...props}
    >
      {children}
    </button>
  );
}
