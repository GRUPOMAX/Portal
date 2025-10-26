import type { InputHTMLAttributes } from 'react';

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full h-10 bg-neutral-900 rounded-xl px-3 outline-none border border-white/10 focus:border-emerald-500 ' +
        (props.className || '')
      }
    />
  );
}
