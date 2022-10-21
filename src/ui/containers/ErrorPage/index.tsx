type ErrorPageProps = {
  error: Error;
  componentStack: string | null;
  resetError: () => void;
};

export const ErrorPage: React.FC<ErrorPageProps> = ({
  error,
  componentStack,
  resetError,
}) => {
  return <div>{error.toString()}</div>;
};
