import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../auth/AppContext'
import { FB_LISTINGS, getReadableCategory, LISTING_DEFAULT_COLOR, ROUTE_EDIT_LISTING } from '../reference'
import { AlertBar, ContentDialog, Divider, MediumDivider, Textbox, HeaderBar, HorizontalGap, ImageStorageDisplay, PageContainer, Spinner } from '../frontend/Recyclables'
import IndividualListingSidebar from './IndividualListingSidebar'
import './Listings.css'
import { ExpandedLabelledText, RolePills, calculateCancellationFee } from './ListingUtils'
import { dashedDateToReadableDate } from '../utilities/dateUtils'
import { PillButton } from '../frontend/Topbar'
import Colours from '../frontend/Colours'
import Listing from '../models/firebase_listings'
import Shift from '../models/firebase_shifts'
import Store from '../models/firebase_store'
import DeleteListing from './DeleteListing'
import { Modal } from 'react-bootstrap'

export default function IndividualListing () {
  // Initialise page
  const params = useParams()
  const id = params.id
  const shiftId = params.shiftId

  // Setup hooks
  const navigate = useNavigate()
  const { currentUser } = useContext(AppContext)

  // Load required data
  const [listingData, setListingData] = useState()
  const [shiftsData, setShiftsData] = useState([])
  const [listingColor, setListingColor] = useState()
  const [employerData, setEmployerData] = useState()
  const [message, setMessage] = useState('')
  const [remove, setRemove] = useState(false)
  const [cancellationFee, setCancellationFee] = useState(0)
  const [shift, setShift] = useState()
  const [listing, setListing] = useState()

  useEffect(() => {
    const fetchData = async () => {
      const shift = new Shift(shiftId)
      await shift.fetch()
      setShift(shift)
      const listingObject = new Listing(id)
      await listingObject.fetchAll()
      setListing(listingObject)
      const cancellationFee = (calculateCancellationFee(getTodaysDate(), shift, listing)).toFixed(2)
      setCancellationFee(cancellationFee)
      if (!listingObject.isActive) {
        setMessage('This listing has been deleted.')
      }
      const shiftsObject = await listingObject.getCorrespondingActiveShifts()
      // setShiftsData(combineShifts(shiftsSnapshot))
      const employer = new Store(listingObject.employerId)
      setListingData(listingObject)
      setListingColor(listingObject.listingColor)
      setShiftsData(shiftsObject)
      setEmployerData(employer)
    }
    fetchData()
  }, [])
  if (!listingData || !employerData) {
    return (
      <PageContainer>
        <Spinner/>
      </PageContainer>
    )
  }

  function getTodaysDate () {
    const today = new Date()
    const date = today.toISOString().split('T')[0]
    return date
  }

  // Logic
  const isOwnListing = () => {
    return listingData?.employerId === currentUser.uid
  }
  const handleBack = () => {
    navigate(-1)
  }
  const handleEdit = () => {
    if (id) {
      navigate(`${ROUTE_EDIT_LISTING}/${id}`)
    }
  }

  const handleRemove = () => {
    setRemove(true)
  }
  const handleCancelRemove = () => {
    setRemove(false)
  }

  const handleConfirmRemove = async () => {
    const listingObject = new Listing(id)
    await listingObject.deleteListing()
    handleCancelRemove()
    navigate(-1)
  }

  const handleChangeColor = async (color) => {
    // Change color of labels
    listingData.changeColor(color)
    setListingColor(color)
  }

  const { listingId, category, createdAt, description, attire, requirement, employerId, lat, lng, streetName, salary, selectedTags, updatedAt, transport, unitNumber, postalCode } = listingData

  // Frontend
  const Attire = <ExpandedLabelledText label='Attire' string={(!attire || attire === '') ? 'No information available' : attire} />
  const Requirement = <ExpandedLabelledText label='Requirement' string={(!requirement || requirement === '') ? 'No information available' : requirement} />
  const ImageDisplay = <ImageStorageDisplay folder={FB_LISTINGS} image={id} height={400} />
  const Salary = <ExpandedLabelledText label='Salary' string={
    transport > 0
      ? `S$${salary}/h + $${transport} claimable for transport per shift`
      : `S$${salary}/h`} />
  const RightBar = <IndividualListingSidebar streetName={streetName} unitNumber={unitNumber} postalCode={postalCode} lat={lat} lng={lng} shifts={shiftsData} shiftId={shiftId} employer={employerData} listingColor={listingColor || LISTING_DEFAULT_COLOR} setListingColor={handleChangeColor} />
  const CategoryRender = <ExpandedLabelledText label='Category' string={getReadableCategory(category)} />
  const UpdatedRender = <ExpandedLabelledText label={`Last Updated ${dashedDateToReadableDate(updatedAt)}`} string='' />

  const contextIcons = [
    <PillButton key={0} icon='fa-arrow-left' text='Go back' onClick={handleBack} />,
    <PillButton key={1} icon='fa-pencil' text='Edit listing' onClick={handleEdit} bgColor={Colours.yellow} />,
    <PillButton key={1} icon='fa-times' text='Remove listing' onClick={handleRemove} bgColor={Colours.red} isWhite={true} />
  ]
  const TagPills = <><RolePills roles={selectedTags} /><DeleteListing trigger={remove} setTrigger={setRemove}></DeleteListing></>

  const ConfirmRemove = (
    <Modal show={remove} onHide={handleCancelRemove} centered>
      <Modal.Header closeButton>
        <span className="modal-header-text">Remove Listing</span>
      </Modal.Header>
      <Modal.Body>
      <div style={{ fontSize: '20px' }}>Are you sure you want to remove this listing?</div>
      <MediumDivider/>
      <div style={{ color: 'red', fontSize: '20px' }}>Cancellation fees: S${(cancellationFee * shift.workerIds.length).toFixed(2)}</div>
      <div style={{ color: 'red' }}>Chargeable per worker: {`S$${cancellationFee}`} </div>
      <div style={{ color: 'red' }}>Number of worker(s): {shift.workerIds.length} </div>
      <br></br>
      <div style={{ textAlign: 'left', fontSize: '15px' }}>For cancellation fee rates, please refer to <a href="https://flexii.net/business">https://flexii.net/business</a></div>
      <MediumDivider/>
      <div>Please provide a reason for removing the listing:</div>
      <Textbox/>
      <div style={{ fontSize: '12px' }}>A valid reason is required to remove the listing and is subject to FLEXII&apos;s approval.</div>
      <div style={{ color: 'red', fontSize: '15px' }}>*Repeated removal of listings may result in suspension of service.</div>
      </Modal.Body>
      <Modal.Footer style={{ justifyContent: 'space-between' }}>
        <div>
          <PillButton icon='fa-times' text='Cancel' onClick={handleCancelRemove} bgColor={Colours.yellow}/>
        </div>
        <div>
          <PillButton icon='fa-times' text='Remove listing' onClick={handleConfirmRemove} bgColor={Colours.red} isWhite={true}/>
        </div>
      </Modal.Footer>
    </Modal>
  )
  if (message !== '') {
    contextIcons.pop()
  }

  return (
    <PageContainer contextIcons={contextIcons}>
      <div className='job-role-container'>
        {HeaderBar('Job Roles:')}
        {TagPills}
     </div>

      <div className='flex-row align-items-start'>
        <ContentDialog flex='1'>
          {message && AlertBar(message, 'danger', false)}
          {ConfirmRemove}
          {ImageDisplay}
          {Attire}
          <div className='m-4'></div>
          {Divider()}
          {Requirement}
          <div className='m-4'></div>
          {Divider()}
          {Salary}
          {CategoryRender}
          {UpdatedRender}
        </ContentDialog>
        {HorizontalGap(2)}
        <ContentDialog flex={'0 0 350px'}>
          {RightBar}
        </ContentDialog>
      </div>
    </PageContainer >
  )
}
