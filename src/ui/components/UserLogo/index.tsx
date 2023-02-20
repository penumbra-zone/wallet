import { DotsSvg } from '../Svg'

type UserLogoProps = {
	onClick?: () => void
	className?: string
}

export const UserLogo: React.FC<UserLogoProps> = ({ className, onClick }) => {
	return (
		<div
			onClick={onClick}
			className={`h2 ext:w-[36px] ext:h-[36px] tablet:w-[52px] tablet:h-[52px] li_gradient rounded-[50%] flex items-center justify-center  ${
				onClick ? 'cursor-pointer' : ''
			} ${className}`}
		>
			<div className='ext:w-[35px] ext:h-[35px] tablet:w-[51px] tablet:h-[51px] bg-brown rounded-[50%] flex items-center justify-center'>
				<DotsSvg />
			</div>
		</div>
	)
}
