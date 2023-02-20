import { ChangeEvent } from 'react'

type ToogleProps = {
	checked: boolean
	handleChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export const Toogle: React.FC<ToogleProps> = ({ checked, handleChange }) => {
	return (
		<label className='inline-flex relative items-center cursor-pointer'>
			<input
				type='checkbox'
				className='sr-only peer'
				checked={checked}
				onChange={handleChange}
			/>
			<div
				className={`w-[51px] h-[31px] bg-dark_grey rounded-[16px] peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5  ${
					checked ? 'after:-left-[5px]' : 'after:left-[2px]'
				}  after:border-white after:border after:bg-white after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-toogle_from peer-checked:via-toogle_via peer-checked:to-toogle_to`}
			></div>
		</label>
	)
}
