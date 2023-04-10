import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccountsSelector } from '../../../account'
import img from '../../../assets/img/logo.png'
import { routesPath } from '../../../utils'
import { selectState } from '../../redux'

type LogoProps = {
	size: 'big' | 'medium' | 'small' | 'small_tabs'
	className?: string
}

export const Logo: React.FC<LogoProps> = ({ size, className }) => {
	const navigate = useNavigate()
	const state = useAccountsSelector(selectState)
	const cn = useMemo(() => {
		if (size === 'small') {
			return `w-[96px] ${className}`
		} else if (size === 'small_tabs') {
			return `w-[108px] ${className}`
		} else if (size === 'big') {
			return `w-[400px] ${className}`
		} else if (size === 'medium') {
			return `w-[192px] ${className}`
		}
	}, [size, className])

	const handleClick = () => navigate(routesPath.HOME)

	return (
		<img
			src={img}
			alt='penumbra log'
			className={`${cn} object-cover cursor-pointer`}
			onClick={!state.isLocked && state.isInitialized ? handleClick : undefined}
		/>
	)
}
