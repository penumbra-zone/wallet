import React from 'react'
import { InputProps } from '../Input'
import { CheckSvg } from '../Svg'

export const CheckBox: React.FC<InputProps> = props => {
	return (
		<label
			className='flex items-center cursor-pointer'
			role='button'
			tabIndex={0}
			onKeyDown={props.onKeyDown}
		>
			<input type='checkbox' className='checkbox' {...props} />
			<div
				className={`flex items-center justify-center w-[30px] h-[30px] rounded-[5px] 
     ${
				props.checked
					? 'bg-gradient-to-r from-[rgba(139,228,217,0.6)] via-[rgba(200,184,128,0.6)] to-[rgba(255,144,47,0.5)]'
					: 'input_default_border'
			}
      hover:bg-gradient-to-r hover:from-[rgba(139,228,217,0.6)] hover:via-[rgba(200,184,128,0.6)] hover:to-[rgba(255,144,47,0.5)]`}
			>
				<div className='flex items-center justify-center w-[29px] h-[29px]'>
					<span className='flex items-center justify-center cursor-pointer bg-brown rounded-[5px] w-[28px] h-[28px]'>
						{props.checked ? <CheckSvg /> : ''}
					</span>
				</div>
			</div>
			<span className='text_body text-light_grey ml-[8px]'>{props.label}</span>
		</label>
	)
}
