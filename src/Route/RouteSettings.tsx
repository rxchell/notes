// Settings for Routing between pages

import {
    BrowserRouter as Router,
    Routes as ReactRoute,
    Route, Navigate
} from 'react-router-dom'
import { AuthRoute, PrivateRoute } from '../UserAuthentication/AuthCheck'
import Auth from '../UserAuthentication/Auth'
import Signup from '../UserAuthentication/SignUpComponent'
import Signin from '../UserAuthentication/SignInComponent'
import Overview from '../DashboardUI/Overview/Overview'
import Search from '../DashboardUI/Search/Search'
import Realtime from '../DashboardUI/Real-timeData/Realtime'
import Forecast from '../DashboardUI/ForecastAnalytics/Forecast'
import UserProfile from '../DashboardUI/UserProfile/UserProfile'
import Historical from '../DashboardUI/HistoricalData/Historical'

export const Routes = () => {
    return (
        <Router >
            <ReactRoute>
                {/* Start with Sign in Page */}
                <Route path="/" element={<Navigate to="/auth/signin" />} />

                <Route path="/auth" element={<Auth />}>
                    <Route path='signin' element={<AuthRoute><Signin /></AuthRoute>} /> 
                    <Route path='signup' element={<AuthRoute><Signup /></AuthRoute>} />
                </Route>

                <Route path="/overview" element={<PrivateRoute><Overview /></PrivateRoute>} />
                <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
                <Route path="/realtime" element={<PrivateRoute><Realtime /></PrivateRoute>} />
                <Route path="/historical" element={<PrivateRoute><Historical /></PrivateRoute>} />
                <Route path="/forecast" element={<PrivateRoute><Forecast /></PrivateRoute>} />
                <Route path="/userprofile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                
            </ReactRoute>
        </Router>
    )
}
