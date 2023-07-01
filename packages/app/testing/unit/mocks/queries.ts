import * as subgraph from '@kwenta/sdk/utils'

export const mockGrapqhlRequest = (returnData: any) => {
	jest.spyOn(require('graphql-request'), 'default').mockImplementation(() => returnData)
}

export const mockReactQuery = (returnValue?: any) => {
	jest.mock('react-query', () => ({
		useQuery: jest.fn().mockReturnValue(returnValue ?? { data: {}, isLoading: false, error: {} }),
	}))
}

export const mockSubgraphQueries = () => {
	jest.spyOn(subgraph, 'getFuturesAggregateStats').mockReturnValue(Promise.resolve([]))
	jest.spyOn(subgraph, 'getFuturesTrades').mockReturnValue(Promise.resolve([]))
	jest.spyOn(subgraph, 'getFuturesPositions').mockReturnValue(Promise.resolve([]))
}
