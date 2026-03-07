import React from 'react'
import ThemeToggle from './ThemeToggle'

export default function Header({ header }) {
  return (
    <div className='h-12 bg-gray-100 dark:bg-neutral-800 p-2 border-b border-t-0 border-r border-neutral-200 dark:border-neutral-700 flex items-center justify-between'>
      <span className='font-bold text-2xl'>{header}</span>
      <ThemeToggle />
    </div>
  )
}
