import React, { ReactElement, useMemo } from 'react'

type ButtonProps = {
	title: string | ReactElement
	disabled?: boolean
	mode: 'gradient' | 'icon_transparent' | 'transparent'
	className?: string
	iconLeft?: JSX.Element
	iconRight?: JSX.Element
	onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
	mode,
	title,
	disabled,
	className,
	iconLeft,
	iconRight,
	onClick,
}) => {
	const cn = useMemo(() => {
		if (mode === 'gradient' && !disabled)
			return `w-[100%] button_gradient text-white text_button ext:h-[36px] tablet:h-[44px] rounded-[10px] ${className}`

		if (mode === 'gradient' && disabled)
			return `w-[100%] button_gradient_disabled text-white-0.3 text_button ext:h-[36px] tablet:h-[44px] rounded-[10px] ${className}`

		if (mode === 'transparent' && !disabled)
			return `w-[100%] bg-brown  text-white text_button border-[1px] border-solid border-dark_grey ext:h-[36px] tablet:h-[44px] rounded-[10px]
      hover:bg-gradient-to-r hover:from-[rgba(139,228,217,0.15)]  hover:to-[rgba(255,144,47,0.15]
      ${className}`

		if (mode === 'transparent' && disabled)
			return `w-[100%] bg-brown  text-light_brown text_button border-[1px] border-solid border-dark_grey ext:h-[36px] tablet:h-[44px] rounded-[10px]
      ${className}`
	}, [className, mode, disabled])

	if (mode === 'icon_transparent')
		return (
			<button
				disabled={disabled}
				onClick={onClick}
				className={`flex text_button items-center justify-center text-light_grey ${className}`}
			>
				<span>{iconLeft}</span>
				<span>{title}</span>
				{iconRight && <span className='ml-[6px]'>{iconRight}</span>}
			</button>
		)

	return (
		<button disabled={disabled} onClick={onClick} className={`${cn}`}>
			{title}
		</button>
	)
}
