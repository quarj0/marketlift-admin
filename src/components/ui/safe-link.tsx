import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

export function SafeLink({ children, ...props }: Props) {
  // Dense admin navigation does not need speculative route loading. Keeping
  // prefetch off also avoids extra short-lived RSC requests during HMR.
  return <Link prefetch={false} {...props}>{children}</Link>;
}
