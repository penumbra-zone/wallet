type EmptyTableHelperProps = {
	text: string
}

export const EmptyTableHelper: React.FC<EmptyTableHelperProps> = ({ text }) => {
	return (
		<div className=' flex items-center justify-center w-[100%] bg-brown rounded-[15px] h-[400px] text_body text-light_brown'>
			{text}
		</div>
	)
}
