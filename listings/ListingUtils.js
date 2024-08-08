import React, { useEffect, useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import {
  IconButton,
  VacancyChooser,
  DateChooser,
  ColumnSpacer,
  AvatarImage
} from '../frontend/Recyclables'
import PropTypes from 'prop-types'
import { dashedDateToReadableDate, checkValidSlot } from '../utilities/dateUtils'
import {
  CATEGORY_FNB,
  CATEGORY_RETAIL,
  ROUTE_LISTING_PROFILES,
  SHIFT_LISTED,
  SHIFT_COMPLETED,
  SHIFT_EXPIRED,
  SHIFT_ONGOING,
  ROUTE_WORKER
} from '../reference'
import { useNavigate } from 'react-router-dom'
import { Timestamp } from 'firebase/firestore'
import Colours from '../frontend/Colours'
import './Listings.css'
import { calculateTimeDifference } from '../admin/AdminUtils'
import { Divider } from '@mui/material'

export const ListingDecal = (category) => {
  return (
    <div className={`listings decal ${category}`}>
      <i className={ListingIcon(category)} />
    </div>
  )
}

export const ListingIcon = (category) => {
  switch (category) {
    case CATEGORY_FNB:
      return 'fas fa-utensils fnb'
    case CATEGORY_RETAIL:
      return 'fas fa-bag-shopping retail'
  }
}

export const Address = ({ streetName, lat, lng }) => {
  const openGoogleMaps = () => {
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    window.open(mapsUrl, '_blank')
  }
  return (
    <div className='listings address contents'>
      <span
        className='listings single-line'
        onClick={openGoogleMaps}
        role='button'
        tabIndex={0}
      >
        <i className='listings icon-beside-text fas fa-location-dot' />
        {streetName || ''}
      </span>
    </div>
  )
}

Address.propTypes = {
  streetName: PropTypes.string,
  lat: PropTypes.number,
  lng: PropTypes.number
}

export const Employer = ({ employer }) => {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate(`${ROUTE_LISTING_PROFILES}/${employer.id}`)
  }
  return (
    <div className='listings employer contents' onClick={handleClick}>
      <span className='listings single-line'>
        <i className='listings icon-beside-text fas fa-briefcase' />
        {employer.businessName || ''}
      </span>
    </div>
  )
}

Employer.propTypes = {
  employer: PropTypes.object.isRequired
}

export const ExpandedLabelledText = ({ label, string }) => {
  return (
    <div className='listings expand group'>
      <div className='listings expand label'>{label.toUpperCase()}</div>
      <div className='listings expand field'>{string}</div>
    </div>
  )
}

ExpandedLabelledText.propTypes = {
  label: PropTypes.string.isRequired,
  string: PropTypes.string
}

export const ExpandedClickableLabelledText = ({ label, string, onClick }) => {
  return (
    <div className='listings expand group'>
      <div className='listings expand label'>{label.toUpperCase()}</div>
      <div className='listings expand field can-be-clicked' onClick={onClick}>
        {string}
      </div>
    </div>
  )
}

ExpandedClickableLabelledText.propTypes = {
  label: PropTypes.string.isRequired,
  string: PropTypes.string,
  onClick: PropTypes.func
}

export const RowShift = ({
  // shiftId,
  date,
  start,
  end,
  handler,
  edit,
  editHandler,
  endsTomorrow
}) => {
  const handleDeleteClick = () => {
    handler(date, start, end)
  }
  const handleEditClick = () => {
    editHandler(date, start, end)
  }
  return (
    <div className='listings shift-container'>
      <div className='listings shift'>
        <span className='listings date'>{dashedDateToReadableDate(date)}</span>
        <div className='listings time-button'>
          <span className='listings time'>{`${start} - ${end}`}<sup hidden={!endsTomorrow} style={{ color: 'red', marginLeft: 5 }}>+1</sup></span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {edit
            ? (
            <div className='listings delete-button'>
              {IconButton(
                'fa-regular fa-pen-to-square',
                'primary',
                handleEditClick
              )}
            </div>
              )
            : (
                ' '
              )}
          <div className='listings delete-button'>
            {IconButton('fas fa-trash', 'danger', handleDeleteClick)}
          </div>
        </div>
      </div>
    </div>
  )
}

RowShift.propTypes = {
  // shiftId: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired,
  edit: PropTypes.bool,
  editHandler: PropTypes.func,
  endsTomorrow: PropTypes.bool
}

export const Slot = ({ start, end, handler }) => {
  return (
    <div className='listings slot-container'>
      <div className='listings slot'>
        <span>{`${start} - ${end}`}</span>
        <div className='listings delete-button'>
          {IconButton('fas fa-trash', 'danger', handler)}
        </div>
      </div>
    </div>
  )
}

Slot.propTypes = {
  start: PropTypes.string.isRequired,
  end: PropTypes.string.isRequired,
  handler: PropTypes.func.isRequired
}

export const EditExistingShift = ({
  start,
  setStart,
  end,
  setEnd,
  date,
  setDate,
  vacancy,
  setVacancy
}) => {
  return (
    <>
      <Form.Label>date</Form.Label>
      <DateChooser date={date} setDate={setDate} isEnabled={true} />
      <div>
        <Form.Label>start time</Form.Label>
        <input
          className='form-control time-chooser'
          type='time'
          value={start}
          onChange={(event) => {
            setStart(event.target.value)
          }}
        />
      </div>
      <div>
        <Form.Label>end time</Form.Label>
        <input
          className='form-control time-chooser'
          type='time'
          value={end}
          onChange={(event) => {
            setEnd(event.target.value)
          }}
        />
      </div>
      <VacancyChooser
        vacancy={vacancy}
        setVacancy={setVacancy}
        label='Vacancies'
        isEnabled={true}
      />
    </>
  )
}

EditExistingShift.propTypes = {
  start: PropTypes.string.isRequired,
  setStart: PropTypes.func.isRequired,
  end: PropTypes.string.isRequired,
  setEnd: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  setDate: PropTypes.func.isRequired,
  vacancy: PropTypes.number.isRequired,
  setVacancy: PropTypes.func.isRequired
}

export const AddNewShift = ({
  start,
  setStart,
  end,
  setEnd,
  date,
  setDate,
  vacancy,
  setVacancy
}) => {
  return (
    <>
      <Form.Label>date</Form.Label>
      <DateChooser date={date} setDate={setDate} isEnabled={true} />
      <div>
        <Form.Label>start time</Form.Label>
        <input
          className='form-control time-chooser'
          type='time'
          value={start}
          onChange={(event) => {
            setStart(event.target.value)
          }}
        />
      </div>
      <div>
        <Form.Label>end time</Form.Label>
        <input
          className='form-control time-chooser'
          type='time'
          value={end}
          onChange={(event) => {
            setEnd(event.target.value)
          }}
        />
      </div>
      <VacancyChooser
        vacancy={vacancy}
        setVacancy={setVacancy}
        label='Vacancies'
        isEnabled={true}
      />
    </>
  )
}
AddNewShift.propTypes = {
  start: PropTypes.string.isRequired,
  setStart: PropTypes.func.isRequired,
  end: PropTypes.string.isRequired,
  setEnd: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  setDate: PropTypes.func.isRequired,
  vacancy: PropTypes.number.isRequired,
  setVacancy: PropTypes.func.isRequired
}
export const ListingStatus = ({ shifts, listing }) => {
  const [activities, setActivities] = useState([])
  useEffect(() => {
    const fetchData = async () => {
      const newActivities = await listing.getCorrespondingActivities()
      setActivities(newActivities)
    }
    fetchData()
  }, [])

  const getStatus = () => {
    const completedActivity = activities.find((activity) => {
      return activity.listingId === listing.id && activity.checkOut
    })

    if (completedActivity) {
      return 'Completed'
    }

    const currentTimestamp = new Date().getTime()
    if (listing.latestApplicationDate.toMillis() >= currentTimestamp) {
      return 'Listed'
    }

    return 'Expired'
  }

  return (
    <div>
      {listing && shifts ? <StatusPill status={getStatus()} /> : <div></div>}
    </div>
  )
}

ListingStatus.propTypes = {
  shifts: PropTypes.array.isRequired,
  listing: PropTypes.object.isRequired
}

export const StatusPill = ({ status }) => {
  const colour =
    status === 'Completed'
      ? 'light'
      : status === 'Listed'
        ? 'warning'
        : 'secondary'
  return (
    <Button
      data-bs-toggle='tooltip'
      data-bs-placement='bottom'
      className='listings shift-pill'
      variant={`${colour}`}
    >
      {status}
    </Button>
  )
}

StatusPill.propTypes = {
  status: PropTypes.string.isRequired
}

export function createTimestampFromDateAndStart (date, start, bef = 30) {
  // Parse the date and start strings into Date objects
  const dateObject = new Date(`${date}T${start}`)

  // Subtract the bef time in milliseconds
  dateObject.setMinutes(dateObject.getMinutes() - bef)

  // Create a Firestore Timestamp
  const timestamp = Timestamp.fromDate(dateObject)

  return timestamp
}

export function ShiftOverviewTitle ({ title, endsTomorrow }) {
  return (
    <div className='shift-overview-title-row'>
      <text className='shift-overview-title'>
        <span>{title}</span><sup className='sup' hidden={!endsTomorrow} style={{ color: 'red', marginLeft: 5 }}>+1</sup>
      </text>
    </div>
  )
}
ShiftOverviewTitle.propTypes = {
  title: PropTypes.string.isRequired,
  endsTomorrow: PropTypes.bool
}

export function ShiftOverviewRow ({ icon, heading, subHeading, endsTomorrow }) {
  return (
    <div className='shift-overview-row' >
      <div className='icon-container'>
        <i className={icon}/>
      </div>
      <ColumnSpacer/>
      <div className='heading'>
        {heading}<sup hidden={!endsTomorrow} style={{ color: 'red', marginLeft: 5 }}>+1</sup>
        <ColumnSpacer/>
        <div className='sub-heading'>
          {subHeading}
        </div>
      </div>
      <ColumnSpacer/>

    </div>
  )
}
ShiftOverviewRow.propTypes = {
  icon: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  subHeading: PropTypes.string.isRequired,
  endsTomorrow: PropTypes.bool
}

export function ShiftOverviewRowPressable ({ icon, heading, subHeading, setter }) {
  return (
    <div onClick={ setter } className='shift-overview-row pressable' >
       <div className='icon-container'>
        <i className={icon}/>
      </div>
      <ColumnSpacer/>
      <div className='heading'>
        {heading}
        <ColumnSpacer/>
        {subHeading}
      </div>
      <ColumnSpacer/>

    </div>
  )
}
ShiftOverviewRowPressable.propTypes = {
  icon: PropTypes.string.isRequired,
  heading: PropTypes.string.isRequired,
  subHeading: PropTypes.string.isRequired,
  setter: PropTypes.func.isRequired
}
export function calculateShiftHours (start, end) {
  // Split the time strings into hours and minutes
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)

  // Calculate the difference in minutes
  const totalMinutes = endHour * 60 + endMinute - (startHour * 60 + startMinute)

  // Convert the difference to hours (as a decimal)
  const shiftHours = totalMinutes / 60

  return shiftHours
}

export function calculateHoursToShiftStart (dateString, timeString) {
  // Combine the date and time strings into a single string
  const combinedDateTimeString = `${dateString} ${timeString}`

  // Create Date objects for the current time and the shift start time
  const currentTime = new Date()
  const shiftStart = new Date(combinedDateTimeString)

  // Calculate the time difference in milliseconds
  const timeDiffMilliseconds = shiftStart - currentTime

  // Calculate the time difference in hours
  const hoursToShiftStart = timeDiffMilliseconds / (1000 * 60 * 60)

  return hoursToShiftStart
}

export const RolePills = (roles) => {
  if (!roles) {
    return <div></div>
  }
  const tags = roles.roles
  return (
    <div className='tags-container'>
      {tags
        ? tags.map((tag) => (
        <Button
          key={tag}
          style={{ backgroundColor: Colours.yellow, borderColor: Colours.yellow, color: '#000000' }}
          data-bs-toggle='tooltip'
          data-bs-placement='bottom'
          className='listings shift-pill'
        >
          {tag}
        </Button>
        ))
        : <div></div>}
    </div>
  )
}

export const ShiftStatusPill = ({ status }) => {
  let color, borderColor

  switch (status) {
    case SHIFT_LISTED:
      color = Colours.white
      borderColor = Colours.yellow
      break
    case SHIFT_COMPLETED:
      color = '#7ec9aa'
      borderColor = '#7ec9aa'
      break
    case SHIFT_EXPIRED:
      color = Colours.lightGrey
      borderColor = Colours.lightGrey
      break
    case SHIFT_ONGOING:
      color = Colours.yellow
      borderColor = Colours.yellow
      break
    default:
      color = Colours.lightGrey
      borderColor = Colours.lightGrey
  }
  return (
    <Button
    key={status}
    style={{ backgroundColor: color, borderColor, color: '#000000' }}
    data-bs-toggle='tooltip'
    data-bs-placement='bottom'
    className='listings shift-status-pill'
  >
    {status}
  </Button>
  )
}

ShiftStatusPill.propTypes = {
  status: PropTypes.string.isRequired
}

export function ShiftOverviewWorkerPill ({ shift, onClick }) {
  const existingWorkers = shift.workerIds.length
  const totalCapacity = shift.vacancies + existingWorkers
  const color = existingWorkers === totalCapacity ? '#7ec9aa' : '#dddddd'
  return (
    <div
    style={{ background: color }}
    className='shift-overview-worker-pill'
    onClick={onClick}
    >
    <i className={'fa-solid fas fa-user-alt'}/>
    <text>{`${existingWorkers}/${totalCapacity}`}</text>
    </div>
  )
}

ShiftOverviewWorkerPill.propTypes = {
  shift: PropTypes.object.isRequired,
  onClick: PropTypes.func
}

export function WorkerBar ({ worker }) {
  const navigate = useNavigate()
  const handleClick = () => {
    navigate(`${ROUTE_WORKER}/${worker.id}`)
  }

  return (
    <div>
      <div className="worker-overview" onClick={handleClick}>
        <AvatarImage photo={worker.photo} />
        <div className="worker-name">{worker.firstName} {worker.lastName}</div>
      </div>
      <Divider/>
    </div>
  )
}

WorkerBar.propTypes = {
  worker: PropTypes.object.isRequired
}

export function calculateCancellationRate (businessCancelDate, shift) {
  const combinedDateTimeString = `${shift.date} ${shift.start}`
  const shiftStartDateTime = new Date(combinedDateTimeString)
  const diff = shiftStartDateTime - businessCancelDate
  const diffHours = Math.floor(diff / (60 * 60 * 1000))
  let cancellationFeeRateHours = 0
  if (diffHours >= 48) {
    return 0
  } else if (diffHours < 48 && diffHours >= 36) {
    cancellationFeeRateHours = 1
  } else if (diffHours < 36 && diffHours >= 24) {
    cancellationFeeRateHours = 2
  } else if (diffHours < 24 && diffHours >= 12) {
    cancellationFeeRateHours = 3
  } else if (diffHours < 12) {
    cancellationFeeRateHours = 4
  }
  return cancellationFeeRateHours
}

export function calculateCancellationFee (businessCancelDate, shift, listing) {
  if (businessCancelDate) {
    const cancellationFeeRateHours = calculateCancellationRate(businessCancelDate, shift, listing)
    const cancellationFeeRateMinutes = 60 * cancellationFeeRateHours
    const shiftMinutesWithoutBreaktime = getShiftDuration(shift)
    return shiftMinutesWithoutBreaktime > cancellationFeeRateMinutes
      ? (cancellationFeeRateMinutes * listing.salary) / 60
      : (shiftMinutesWithoutBreaktime * listing.salary) / 60
  }
  // if the activity doesn't have businessCancelDate(previous specification)
  const shiftDuration = getShiftDuration(shift)
  return shiftDuration >= 240 ? (listing.salary * 240) / 60 : (listing.salary * shiftDuration) / 60
}

export function getShiftDuration (shift) {
  const shiftMinutes = calculateTimeDifference(shift.start, shift.end) * 60
  let breakTimeMinutes = 0
  let [breakHours, breakMinutes] = [0, 0]
  if (shift.breakTime !== null && shift.breakTime !== '') {
    [breakHours, breakMinutes] = shift.breakTime.split(':').map(Number)
    breakTimeMinutes = breakHours * 60 + breakMinutes
  }
  return shiftMinutes - breakTimeMinutes
}

export const validateShiftValues = (date, start, end, breakTime, vacancies, setAlert, setAlertLevel) => {
  let errorMessage = ''
  if (!date) {
    errorMessage = 'Please choose a date'
  } else if (!start) {
    errorMessage = 'Please choose a start time'
  } else if (!end) {
    errorMessage = 'Please choose an end time'
  } else if (!breakTime) {
    errorMessage = 'Please set a break time'
  } else if (!vacancies || vacancies < 0) {
    errorMessage = 'Please choose the number of workers needed'
  } else if (!checkValidSlot(start, end, date, breakTime, vacancies)) {
    errorMessage = 'Please specify a valid time slot.'
  }

  if (errorMessage) {
    setAlertLevel('warning')
    setAlert(errorMessage)
    return false
  }
  return true
}
