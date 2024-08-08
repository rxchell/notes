import React, { useState, useEffect } from 'react'
import { Address, Employer, ListingStatus, RolePills, ShiftOverviewTitle, ShiftStatusPill, ShiftOverviewWorkerPill, WorkerBar } from './ListingUtils'
import PropTypes from 'prop-types'

import {
  ROUTE_INDIVIDUAL_LISTING,
  SHIFT_COMPLETED,
  SHIFT_EXPIRED
} from '../reference'
import { Button, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap'
import { convertBreakTimeToDecimal, dashedDateToReadableDate, getDateForListing, getDuration, getListingStatus, isAfter } from '../utilities/dateUtils'
import './Listings.css'
import useWindowSize from '../utilities/useWindowSize'
import { useNavigate } from 'react-router-dom'
import { LongDivider } from '../frontend/Recyclables'
import Worker from '../models/firebase_worker'
import Store from '../models/firebase_store'
import Listing from '../models/firebase_listings'
import Shift from '../models/firebase_shifts'
import { WorkerBarModal } from './WorkersInformation'
import { Divider } from '@mui/material'

export function ShiftOverview ({ shift }) {
  const navigate = useNavigate()
  const [listing, setListing] = useState()
  const [acitvities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  useEffect(() => {
    const fetchData = async () => {
      const corrListing = await shift.getCorrespondingListing()
      const corrActivity = await shift.getCorrespondingActivity()
      setActivities(corrActivity)
      setListing(corrListing)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  const handleNavigate = () => {
    navigate(`${ROUTE_INDIVIDUAL_LISTING}/${listing.id}/${shift.id}`)
  }
  const notReady = (<div className="listings parent"></div>)

  if (listing && shift) {
    const endsTomorrow = !isAfter(shift.start, shift.end) && shift.start !== shift.end
    const listingStatus = getListingStatus(shift.date, shift.start, shift.end)
    const status = listingStatus === SHIFT_EXPIRED ? shift.workerIds.length > 0 ? SHIFT_COMPLETED : SHIFT_EXPIRED : listingStatus
    const ShiftDate = <ShiftOverviewTitle title={`${getDateForListing(shift.date)} (${shift.start}-${shift.end})`} endsTomorrow={endsTomorrow} />
    const ShiftDetail = <ShiftOverviewSalaryRow listing={listing} shift={shift} setter={handleExpand} subHeading={!isExpanded ? 'View Breakdown' : 'Collapse View'}/>
    const ShiftOverviewWorkers = <ShiftOverviewWorkerPill shift={shift} onClick={() => setShowModal(true)} />
    const ShiftWorkersModal = <ShowWorkersModal shift={shift} showModal={showModal} setShowModal={setShowModal} />
    const ShiftOverviewTags = <ShiftWorkerTags tags={listing.selectedTags}/>
    const ShiftOverviewSalaryBreakdown = <ShiftSalaryBreakdown listing={listing} shift={shift}/>
    const Status = <ShiftStatusPill status={status} />
    const render = (
      <div className="listings parent position-relative">
        <div className='first-col'>
        <a onClick={handleNavigate}>
          {ShiftDate}
        </a>
        {ShiftOverviewWorkers}
        {ShiftWorkersModal}
        {ShiftDetail}
        {isExpanded ? ShiftOverviewSalaryBreakdown : null}
        {ShiftOverviewTags}
        </div>
        <div className='status position-absolute top-right'>
          {Status}
        </div>
      </div>
    )

    return render
  } else if (isLoading) {
    return notReady
  }
}

ShiftOverview.propTypes = {
  shift: PropTypes.object.isRequired
}

export function ShowWorkersModal ({ shift, showModal, setShowModal }) {
  if (shift.workerIds.length === 0) {
    return
  }
  const [workerData, setWorkerData] = useState([])

  useEffect(() => {
    const fetchWorkers = async () => {
      const updatedWorkerData = await Promise.all(
        shift.workerIds.map(async (worker) => {
          const user = new Worker(worker)
          await user.fetchAll()
          return user
        })
      )
      setWorkerData(updatedWorkerData)
    }
    fetchWorkers()
  }, [shift])

  const handleClose = () => setShowModal(false)

  return (
      <Modal show={showModal} onHide={handleClose} size="md">
        <Modal.Header closeButton>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className='workers-modal-title'>Workers</div>
            <ShiftOverviewWorkerPill shift={shift} />
          </div>
        </Modal.Header>
        <Modal.Body className="modal-body">
          {workerData.map((wk, index) => (
            <React.Fragment key={wk.id}>
              <WorkerBarModal worker={wk}/>
              {index < workerData.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Modal.Body>
      </Modal>
  )
}

ShowWorkersModal.propTypes = {
  shift: PropTypes.object.isRequired,
  showModal: PropTypes.bool.isRequired,
  setShowModal: PropTypes.func.isRequired
}

export function ListingOverview ({ obj }) {
  // Initialise page
  const size = useWindowSize()
  const navigate = useNavigate()

  // Load required data
  const [listing, setListing] = useState()
  const [store, setStore] = useState()
  const [shifts, setShifts] = useState([])
  const [firstShiftDate, setFirstShiftDate] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { data, id } = obj
  const {
    category,
    description,
    employerId,
    lat,
    lng,
    streetName,
    salary,
    selectedTags,
    transport
  } = data

  // Lifecycle
  useEffect(() => {
    const fetchData = async () => {
      try {
        const newListing = new Listing(id)
        const newStore = new Store(employerId)
        await newListing.fetch()
        await newStore.fetch()
        const newShiftPromise = await newListing.getCorrespondingActiveShifts()
        const newListingFirstShiftDate = await newListing.getFirstShiftDate()
        setListing(newListing)
        setStore(newStore)
        setShifts(newShiftPromise)
        setFirstShiftDate(newListingFirstShiftDate)
        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setIsLoading(false) // Handle errors and set loading to false
      }
    }

    fetchData()
  }, [])

  // Logic
  const handleExpand = () => {
    navigate(`${ROUTE_INDIVIDUAL_LISTING}/${id}`)
  }

  // Frontend
  const notReady = (<div className="listings parent"></div>)
  if (listing && store && shifts) {
    const Title = (
      <div className="listings title underline-on-hover" onClick={handleExpand}>
        {`S$${salary}/h`}
      </div>
    )
    const Description = (
      <div className="listings description contents">{description}</div>
    )
    const Shifts = <ShiftBubbleBar shifts={shifts} size={size} />
    const Status = <ListingStatus shifts={shifts} listing={listing} />
    const BusinessName = <Employer employer={store} />
    const Location = <Address streetName={streetName} lat={lat} lng={lng} />
    const LinksBar = <div className="listings linksbar">{Location}{Status}</div>
    const JobTags = <RolePills roles={selectedTags}/>
    const render = (
      <div className="listings parent">
        <div className="listings text">
          <div className='listing-overview-title'>
            {JobTags}
            {Title}
          </div>
          {LinksBar}
          <div className="listings shifts-box">{Shifts}</div>
        </div>
      </div>
    )

    return render
  } else if (isLoading) {
    return notReady
  }
}

ListingOverview.propTypes = {
  obj: PropTypes.object.isRequired
}

export function ShiftBubbleBar ({ shifts, size }) {
  if (!size) {
    return <div></div>
  }

  if (shifts.length === 0) {
    return <div className="listings no-shifts">No shifts available</div>
  } else {
    const maxVisibleShiftBubbles = Math.floor((size.width * 0.5) / 90)
    const visibleShifts =
    shifts.length === maxVisibleShiftBubbles + 1
      ? shifts.slice(0, maxVisibleShiftBubbles + 1)
      : shifts.slice(0, maxVisibleShiftBubbles)
    const additionalShifts = shifts.length - visibleShifts.length
    return (
    <div className="listings shift-bubble-bar">
      {visibleShifts.map((shift, index) => (
        <ShiftBubble
          key={index}
          shift={shift}
          listingPage={true}
        />
      ))}
      {additionalShifts > 0 && <MoreBubble num={additionalShifts} />}
    </div>
    )
  }
}

ShiftBubbleBar.propTypes = {
  shifts: PropTypes.array.isRequired,
  size: PropTypes.object.isRequired
}

export function ShiftBubble ({ shift, listingPage = false }) {
  const [showModal, setShowModal] = useState(false)
  const [workerData, setWorkerData] = useState([])
  const [curShift, setCurShift] = useState()
  const getColour = (num) => {
    return num >= 5 ? 'success' : num >= 3 ? 'primary' : 'danger'
  }
  useEffect(() => {
    const fetchShift = async () => {
      const newShift = new Shift(shift.id)
      await newShift.fetch()
      setCurShift(newShift)
    }
    fetchShift()
  }, [])

  useEffect(() => {
    if (curShift && curShift.workerIds) {
      const fetchData = async () => {
        const updatedWorkerData = await Promise.all(
          curShift.workerIds.map(async (worker) => {
            const user = new Worker(worker)
            await user.fetchAll()
            return user
          })
        )
        setWorkerData(updatedWorkerData)
      }
      fetchData()
    }
  }, [curShift])
  if (!curShift) {
    return <div></div>
  } else {
    const existingWorkers = curShift.workerIds.length
    const totalCapacity = curShift.vacancies + existingWorkers
    const endsTomorrow = curShift.start && curShift.end ? !isAfter(curShift.start, curShift.end) && curShift.start !== curShift.end : false

    const handleClose = () => setShowModal(false)
    const handleOpen = () => {
      setShowModal(true)
    }
    const Pill = (
    <Button
      data-bs-toggle="tooltip"
      data-bs-placement="bottom"
      className="listings shift-pill"
      // variant={`outline-${getColour(slots.length)}`}
    >
      {dashedDateToReadableDate(curShift.date)}
    </Button>
    )
    const Avail = (
    <>
      <Button
        data-bs-placement="bottom"
        className="listings shift-pill"
        variant="light"
        onClick={handleOpen}
      >
        <div className="listings shifts-box">
          <i className="listings icon-beside-text fas fa-solid fa-person tag" />
          {existingWorkers}/{totalCapacity}
        </div>
      </Button>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            Matching workers {existingWorkers}/{totalCapacity}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>Workers</Modal.Body>
        <Modal.Body className="modal-body">
          {workerData.map((wk) => (
            <WorkerBar key={wk.id} worker={wk} />
          ))}
        </Modal.Body>
      </Modal>
    </>
    )

    const Render = () => {
      return (
      <div className="listings shifts-box">
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip title="Time slots">

                <div
                  className="listings slots-tooltip"

                >{`${curShift.start || curShift.startTime} - ${curShift.end || curShift.endTime}`}<sup hidden={!endsTomorrow} style={{ color: 'red', marginLeft: 5 }}>+1</sup></div>

            </Tooltip>
          }
        >
          {Pill}
        </OverlayTrigger>

        {listingPage ? Avail : null}
      </div>
      )
    }
    return Render()
  }
}

ShiftBubble.propTypes = {
  shift: PropTypes.object.isRequired,
  listingPage: PropTypes.boolean
}

export function MoreBubble ({ num }) {
  return (
    <Button
      className="listings shift-pill"
      variant="outline-success"
    >{`${num} more dates`}</Button>
  )
}

MoreBubble.propTypes = {
  num: PropTypes.number.isRequired
}

export function ShiftOverviewSalaryRow ({ listing, shift, setter, subHeading }) {
  let duration = (getDuration(shift.start, shift.end))
  duration = duration[0] + duration[1] / 60 - convertBreakTimeToDecimal(shift.breakTime)
  return (
    <div className='shift-overview-row' >
       <div className='icon-container'>
        <i className='fa-solid fa-money-bill'/>
      </div>
      <div className='heading'>
        S${(listing.salary * duration).toFixed(2)} / Worker
      </div>
      <a className='shift-overview-expand-link' onClick={setter}>
        {subHeading}
      </a>
    </div>
  )
}

ShiftOverviewSalaryRow.propTypes = {
  listing: PropTypes.object.isRequired,
  shift: PropTypes.object.isRequired,
  setter: PropTypes.func.isRequired,
  subHeading: PropTypes.string.isRequired
}

export function ShiftWorkerTags ({ tags }) {
  const Tags = <RolePills roles={tags} />
  return (
    <div className='workers-tags-container'>
        {Tags}
    </div>
  )
}

ShiftWorkerTags.propTypes = {
  tags: PropTypes.array.isRequired
}

export function ShiftSalaryBreakdown ({ listing, shift }) {
  let duration = (getDuration(shift.start, shift.end))
  const breakTime = convertBreakTimeToDecimal(shift.breakTime)
  duration = duration[0] + duration[1] / 60 - breakTime
  const salary = (listing.salary * duration).toFixed(2)
  return (
    <div>
      <LongDivider/>
      <div className='shift-salary-breakdown-container'>
        <ShiftSalaryBreakdownRow title='Rate:' value={`S$${listing.salary} per hr`}/>
        <ShiftSalaryBreakdownRow title='Duration:' value={`${(duration).toFixed(2)}hrs (${(breakTime).toFixed(1)}hrs Break)`}/>
        <ShiftSalaryBreakdownRow title='Total Payment:' value={`S$${salary} x ${shift.workerIds.length} = S$${(listing.salary * duration * shift.workerIds.length).toFixed(2)}`}/>
      </div>
      <LongDivider/>
    </div>
  )
}

ShiftSalaryBreakdown.propTypes = {
  listing: PropTypes.object.isRequired,
  shift: PropTypes.object.isRequired
}

export function ShiftSalaryBreakdownRow ({ title, value }) {
  return (
    <div className='shift-salary-breakdown-row'>
      <div className='title'>
        {title}
      </div>
      <div className='value'>
        {value}
      </div>
    </div>
  )
}

ShiftSalaryBreakdownRow.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired
}
