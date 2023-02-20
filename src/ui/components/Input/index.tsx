import { ReactElement, useRef, useState } from 'react'
import { CloseEyeSvg, OpenEyeSvg } from '../Svg'

export interface InputProps extends React.InputHTMLAttributes<HTMLElement> {
	label?: string | ReactElement
	isError?: boolean
	helperText?: string
	customType?: 'password' | 'text'
	className?: string
	leftSvg?: ReactElement
	rightElement?: ReactElement
	labelClassName?: string
}

export const Input: React.FC<InputProps> = ({
	isError = false,
	helperText,
	label,
	placeholder,
	customType = 'text',
	className,
	leftSvg,
	rightElement,
	labelClassName = 'h2 mb-[8px]',
	...props
}) => {
	const inputRef = useRef<HTMLInputElement>(null)
	const [isFocus, setFocus] = useState(false)
	const [isOpenPass, setIsOpenPass] = useState(false)

	const containerHandler = () => {
		inputRef.current?.focus()
		setFocus(true)
	}

	const inputBlurHandler = () => setFocus(false)

	const toggleEye = event => {
		event.stopPropagation()
		setIsOpenPass(state => !state)
	}

	return (
		<div className={className}>
			<p className={labelClassName}>{label}</p>
			<div
				className={`w-[100%] h-[52px] rounded-[15px] flex items-center justify-center  
        ${
					isError
						? 'bg-red'
						: isFocus || props.value
						? 'bg-gradient-to-r from-[rgba(139,228,217,0.6)] via-[rgba(200,184,128,0.6)] to-[rgba(255,144,47,0.5)]'
						: 'input_default_border hover:bg-gradient-to-r hover:from-[rgba(139,228,217,0.6)] hover:via-[rgba(200,184,128,0.6)] hover:to-[rgba(255,144,47,0.5)]'
				} 
        `}
				onClick={containerHandler}
			>
				<div
					className={`w-[calc(100%-2px)] rounded-[15px] ${
						props.value && !isError ? 'bg-brown' : 'bg-background'
					}`}
				>
					<div
						className={`w-[100%] h-[50px] ${
							props.value && !isError ? 'input_typing_bg' : 'bg-brown'
						} cursor-text rounded-[15px] flex justify-center items-center`}
					>
						{leftSvg}
						<input
							ref={inputRef}
							className={`${
								customType === 'password'
									? 'w-[calc(100%-80px)]'
									: 'w-[calc(100%-40px)]'
							} h-[50px] rounded-[15px] border-[none] px-[5px] bg-transparent text_body
              active:outline-none focus:outline-none placeholder:text-[#524B4B] placeholder:text_body`}
							onBlur={inputBlurHandler}
							placeholder={placeholder}
							type={
								customType === 'password'
									? isOpenPass
										? 'text'
										: 'password'
									: 'text'
							}
							{...props}
						/>
						{rightElement}
						{customType === 'password' && (
							<div
								className='ml-[18px] mr-[12px] cursor-pointer'
								onClick={toggleEye}
							>
								{isOpenPass ? <OpenEyeSvg /> : <CloseEyeSvg />}
							</div>
						)}
					</div>
				</div>
			</div>
			{helperText && (
				<div className='pt-[8px] h-[30px] '>
					{isError && (
						<p className='w-[100%]  text-red text_body'>{helperText}</p>
					)}
				</div>
			)}
		</div>
	)
}
