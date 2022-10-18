export const mockGrapqhlRequest = (returnData: any) => {
	jest.spyOn(require('graphql-request'), 'default').mockImplementation(() => returnData);
};

export const mockReactQuery = (returnValue?: any) => {
	jest.mock('react-query', () => ({
		useQuery: jest.fn().mockReturnValue(returnValue ?? { data: {}, isLoading: false, error: {} }),
	}));
};
