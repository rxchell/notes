import Api from './Api';
import { PondDataEntry } from '../DashboardUI/HistoricalData/types';
import { ForecastParameterData, ForecastSensorData, ForecastPondData, HistoricalPredictionData } from '../DashboardUI/ForecastAnalytics/ForecastTypes';

export interface ComponentParams {
    // Define any parameters needed for creating component
}

interface AggregatedData {
    [group: string]: {
        [biologicalName: string]: number;
    };
} 

export interface HistoricalPhysicalData {
    pondType: string;
    startDate: string;
    endDate: string;
}

export interface HistoricalPredictedPhysicalData {
    pondType: string;
    pathogenType: string;
    startDate: string;
    endDate: string;
}

class DataClient {
    async createComponent(params: ComponentParams, componentId: string, userEmail: string): Promise<{ status?: string }> {
        try {
            const response = await Api.request('/api/create-component/', {
                method: 'POST',
                data: { params, componentId, userEmail },
            });
            return response;
        } catch (error) {
            console.error('Error creating components:', error);
            return { status: 'fail' };
        }
    }

    async fetchComponentMetaDataByEmail(userEmail: string): Promise<{ status?: string; data?: string[]}> {
        try {
            const response = await Api.request('/api/fetch-components-metadata/', {
                method: 'POST',
                data: { userEmail },
            });
            return response;
        } catch (error) {
            console.error('Error fetching component metadata:', error);
            return { status: 'fail' };
        } 
    }

    async fetchComponentData(metaData: string): Promise<{ status?: string; componentId?: string; chartType?: string; aggregatedData?: AggregatedData  }> {
        try {
            const response = await Api.request(`/api/fetch-components-data/`, {
                method: 'POST',
                data: { metaData },
            });
            return response;
        } catch (error) {
            console.error('Error fetching component data:', error);
            return { status: 'fail' };
        }
    }

    async fetchPhysicalPondData(params: HistoricalPhysicalData): Promise<{ status?: string; data?: PondDataEntry[] }> {
        try {
            console.log('Fetching physical pond data:', params)
            const response = await Api.request('/api/fetch-physical-pond-data/', {
                method: 'POST',
                data: params,
            }); 
            return response;
        } catch (error) {
            console.error('Error fetching historical physical pond data:', error);
            return { status: 'fail' };
        }
    }

    async fetchPredictedPondData(params: HistoricalPredictedPhysicalData): Promise<{ status?: string; data?: ForecastPondData }> {
        try {
            console.log('Fetching predicted pond data:', params);
            const response = await Api.request('/api/fetch-prediction-pond-data/', {
                method: 'POST',
                data: params,
            });
            return response;
        } catch (error) {
            console.error('Error fetching predicted pond data:', error);
            return { status: 'fail' };
        }
    }

    async deleteComponent(componentId: string): Promise<{ status?: string; error?: string }> {
        try {
            const response = await Api.request(`/api/delete-component/${componentId}`, {
                method: 'DELETE',
            });
            return response;
        } catch (error) {
            console.error('Error deleting component:', error);
            return { status: 'fail' };
        }
    }
}

export const dataClient = new DataClient();
