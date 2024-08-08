import React, { useState, useContext, useEffect } from 'react'
import { useUnauthenticatedRedirect } from '../auth/Redirect'
import { useNavigate, useParams } from 'react-router-dom'
import {
  JCT_1HBS, JCT_2HBS, JCT_3HBS, JCT_5HBS, JCT_8HBS, JCT_12HBS, JCT_24HBS, JCT_48HBS, JCT_RCMD, JCT_RCMD_V, JCT_1HBS_V, JCT_2HBS_V, JCT_3HBS_V, JCT_5HBS_V, JCT_8HBS_V, JCT_12HBS_V, JCT_24HBS_V, JCT_48HBS_V,
  CATEGORY_FNB,
  CATEGORY_LOGISTICS,
  CATEGORY_RETAIL,
  CATEGORY_OTHERS,
  CATEGORY_EVENT,
  FB_LISTINGS,
  ROUTE_MY_LISTINGS,
  FB_STORE,
  TAG_DEF_FNB, TAG_DEF_LOG, TAG_DEF_RET, TAG_DEF_OTH, TAG_DEF_EVT,
  AVERAGE_SALARIES
} from '../reference'
import {
  ActionBar,
  ActionButton,
  AlertBar,
  BooleanField,
  ContentDialog,
  Disabler,
  Divider,
  Dropdown,
  CategoryDropdown,
  EditField,
  EditFieldLarge,
  HeaderBar,
  PageContainer,
  PhotoUpload,
  Spinner,
  TagBox,
  SettingsBox
} from '../frontend/Recyclables'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db, storage } from '../firebase/Firebase'
import { ref, uploadBytes } from 'firebase/storage'
import { AppContext } from '../auth/AppContext'
import { getCurrentDateString } from '../utilities/dateUtils'
import errorHandler from '../frontend/ErrorHandler'
import MapPicker from '../utilities/MapPicker'
import './Listings.css'
import { Button, Modal } from 'react-bootstrap'
import axios from 'axios'
import { getPhotoFileFromStorage } from '../backend/Utilities'
import { generateTrigram } from '../utilities/generateTrigram'
import { PillButton } from '../frontend/Topbar'
import Colours from '../frontend/Colours'
import Store from '../models/firebase_store'
import Listing from '../models/firebase_listings'
import EditShifts from './EditShifts'

export default function EditListing () {
  // Initialise page
  useUnauthenticatedRedirect()
  const params = useParams()
  const id = params.id

  // Setup hooks
  const navigate = useNavigate()
  const { currentUser, profile } = useContext(AppContext)

  // State
  // Form
  const [store, setStore] = useState()
  const [storeGroups, setStoreGroups] = useState([])
  const [documentId, setDocumentId] = useState('')
  const [jobClosingTime, setJobClosingTime] = useState(0)
  const [attire, setAttire] = useState('')
  const [requirement, setRequirement] = useState('')
  const [category, setCategory] = useState('')
  const [defaultCategoryTags, setDefaultCategoryTags] = useState({})
  const [selectedTags, setSelectedTags] = useState([])
  const [categoryTags, setCategoryTags] = useState([])
  const [boolCategoryTags, setBoolCategoryTags] = useState(false)
  const [salary, setSalary] = useState('')
  const [boolTransport, setBoolTransport] = useState(false)
  const [transport, setTransport] = useState('')
  const [streetName, setStreetName] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [locationInfo, setLocationInfo] = useState('')
  const [shifts, setShifts] = useState([])
  const [others, setOthers] = useState()
  const [groups, setGroups] = useState([])
  const [isGroupsSettings, setGroupsSettings] = useState(false)
  const [settings, setSettings] = useState('')
  let dates = []

  // Frontend state
  const [alert, setAlert] = useState('')
  const [alertLevel, setAlertLevel] = useState('info')
  const [isSaveButtonDisabled, setSaveButtonDisabled] = useState(false)
  const [isCancelButtonDisabled, setCancelButtonDisabled] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const [selectedPhoto, setSelectedPhoto] = useState(null)

  // Logic

  const handleSettingSelection = (value) => {
    const groupsCopy = [...groups]
    if (value === 'group') { // DO reference
      setGroupsSettings(true)
    } else if (value === 'all') {
      setGroupsSettings(false)
      // Unselect all groups
      groupsCopy.forEach((group) => {
        group.selected = false
      })
      setGroups(groupsCopy)
    }
  }

  const handleGroupSelection = (value) => {
    const groupsCopy = [...groups]
    const indexNewSelected = groupsCopy.findIndex(group => group.id === value)
    const indexCurrentSelected = groupsCopy.findIndex(group => group.selected === true)
    if (indexCurrentSelected === -1) {
      groupsCopy[indexNewSelected].selected = true
    } else {
      groupsCopy[indexCurrentSelected].selected = false
      groupsCopy[indexNewSelected].selected = true
    }
    setGroups(groupsCopy)
  }

  const setJobClosingTimeOptions = () => {
    const opts = []
    const dropdownLabels = [JCT_RCMD, JCT_1HBS, JCT_2HBS, JCT_3HBS, JCT_5HBS, JCT_8HBS, JCT_12HBS, JCT_24HBS, JCT_48HBS]
    const dropdownValues = [JCT_RCMD_V, JCT_1HBS_V, JCT_2HBS_V, JCT_3HBS_V, JCT_5HBS_V, JCT_8HBS_V, JCT_12HBS_V, JCT_24HBS_V, JCT_48HBS_V]
    if (dropdownLabels.length === dropdownValues.length) {
      for (let i = 0; i < dropdownValues.length; i++) {
        opts.push({ value: dropdownValues[i], label: dropdownLabels[i], disabled: false })
      }
    }
    return opts
  }

  const handleSaveCategoryTag = (newTag) => {
    // Add-update categoryTags (listing)
    const updatedTags = categoryTags
    const index = updatedTags.findIndex(catTag => catTag.categoryTag === newTag.categoryTag)
    if (index === -1) {
      updatedTags.push(newTag)
      setCategoryTags(updatedTags)
    }
  }

  const handleRemoveCategoryTag = (tag, index) => {
    console.log('Current tags: ' + categoryTags)
    console.log('Tag to remove: ' + tag)
    if (!tag.default && categoryTags) {
      const duplicatedCategoryTags = [...categoryTags]
      const index = duplicatedCategoryTags.findIndex(catTag => catTag.categoryTag === tag.categoryTag)
      if (index !== -1) {
        duplicatedCategoryTags.splice(index, 1)
        const createdStoreTags = duplicatedCategoryTags.filter(tag => tag.default === false).map(tag => tag.categoryTag) || []
        const currStoreTags = store.tags > 0 ? store.tags.concat(createdStoreTags) : createdStoreTags
        store.uploadTags(currStoreTags, category)
        setCategoryTags(duplicatedCategoryTags)
        // Remove tag from all other listings
        store.removeTagFromListings(tag.categoryTag)
      }
    } else {
      setAlertLevel('warning')
      setAlert('You are not allowed to remove a default tag.')
    }
  }

  const handleEditCategoryTag = (editedTag) => {
    // editedTag contains { tag, index }
    if (editedTag.tag.categoryTag !== categoryTags[editedTag.index].categoryTag) {
      // If the tag is changed, edit
      const duplicatedCategoryTags = [...categoryTags.slice(0, editedTag.index), editedTag.tag, ...categoryTags.slice(editedTag.index + 1)]
      setCategoryTags(duplicatedCategoryTags)
      // Save update
      const createdStoreTags = duplicatedCategoryTags.filter(tag => tag.default === false && !checkTagIncluded(tag.categoryTag, store.tags[category])).map(tag => tag.categoryTag) || []
      const currStoreTags = store.tags > 0 ? store.tags.concat(createdStoreTags) : createdStoreTags
      store.uploadTags(currStoreTags, category)
      // Edit tag from all other listings
      store.editTagFromListings(categoryTags[editedTag.index].categoryTag, editedTag.tag.categoryTag)
    }
  }

  const handleTagSelection = (text) => {
    const catTagsCopy = [...categoryTags]
    const index = catTagsCopy.findIndex(catTag => catTag.categoryTag === text)
    if (index !== -1) {
      if (catTagsCopy[index].selected) {
        catTagsCopy[index].selected = false
      } else {
        catTagsCopy[index].selected = true
      }
      setCategoryTags(catTagsCopy)
    }
  }

  const handleCategoryChange = (category) => {
    setCategory(category)
    // Set default tags for the selected category
    const selCategoryDefaultTags = []
    if (defaultCategoryTags[category]) {
      defaultCategoryTags[category].forEach(tag => {
        selCategoryDefaultTags.push({ categoryTag: tag, selected: false, default: true })
      })
    }

    // Set saved tags for the selected category
    const updatedCategoryTags = []
    if (store.tags[category]) {
      store.tags[category].forEach(tag => {
        updatedCategoryTags.push({ categoryTag: tag, selected: false, default: false })
      })
    }
    setCategoryTags(selCategoryDefaultTags.concat(updatedCategoryTags))
    setBoolCategoryTags(true)
  }

  const handleCancel = () => {
    navigate(alertLevel === 'success' ? -2 : -1)
  }
  const handleDelete = () => {
    setShowDelete(true)
  }
  const handleCancelDelete = () => {
    setShowDelete(false)
  }

  const handleConfirmDelete = async () => {
    setCancelButtonDisabled(true)
    setSaveButtonDisabled(true)
    const listingObject = new Listing(id)
    await listingObject.deleteListing()
    handleCancelDelete()
    setCancelButtonDisabled(false)
    setAlertLevel('success')
    setAlert('Listing deleted successfully.')
  }

  function checkTagSelected () {
    if (category) {
      const filteredTags = categoryTags.filter((tag) => tag.selected === true)
      return filteredTags.length > 0
    } else {
      return false
    }
  }

  const handleSave = async () => {
    if (isSaveButtonDisabled) {
      setAlertLevel('warning')
      if (!attire) {
        setAlert('Please enter an attire.')
      } else if (!requirement) {
        setAlert('Please enter a requirement.')
      } else if (!category) {
        setAlert('Please select a category.')
      } else if (!salary) {
        setAlert('Please enter a salary.')
      } else if (!transport && boolTransport) {
        setAlert('Please enter a transport allowance.')
      } else if (!streetName) {
        setAlert('Please enter a valid address.')
      } else if (shifts.length === 0) {
        setAlert('Please add at least one shift.')
      } else if (parseFloat(salary) <= 0) {
        setAlert('Please set a valid salary')
      } else if (!checkTagSelected()) {
        setAlert('Please add at least one category tag.')
      }
      return
    }
    setSaveButtonDisabled(true)
    setCancelButtonDisabled(true)
    if (lat === 0 && lng === 0) {
      // geocode the street address
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${streetName}&components=country:SG&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
      )
      const results = response.data.results
      if (results.length > 0) {
        const result = results[0]
        setLat(result.geometry.location.lat)
        setLng(result.geometry.location.lng)
      } else {
        setAlertLevel('warning')
        setAlert('Invalid address.')
        setCancelButtonDisabled(false)
        return
      }
    }

    const businessName = store.businessName
    const trigram = generateTrigram(
      businessName,
      category,
      streetName
    )

    dates = [...new Set(shifts.map((shift) => shift.date))]
    // Sort the dates array
    dates.sort((a, b) => {
      const dateA = new Date(a)
      const dateB = new Date(b)
      return dateA - dateB
    })

    // Update shifts
    shifts.forEach((shift) => {
      shift.update()
    })

    const selectedTags = []
    if (categoryTags.length !== 0) {
      categoryTags.forEach(elem => {
        if (elem.selected) {
          selectedTags.push(elem.categoryTag)
        }
      })
    }
    const categoryVal = category === 'others' ? others : null
    const latestDate = new Date(dates[dates.length - 1])
    latestDate.setHours(latestDate.getHours() + 16) // account for timezone and add a day
    await handleUpload(documentId)
    const listing = {
      // TODO: if shifts are editable, update the latestApplicationDate
      id: documentId,
      dates,
      latestApplicationDate: Timestamp.fromDate(latestDate),
      category,
      selectedTags,
      othersCategory: categoryVal,
      jobClosingTime: parseInt(jobClosingTime),
      attire,
      requirement,
      employerId: currentUser.uid,
      isActive: true,
      streetName,
      lat,
      lng,
      locationInfo,
      salary: parseFloat(salary),
      transport: transport ? parseFloat(transport) : 0,
      settings: getSelectedGroup(),
      updatedAt: getCurrentDateString(),
      trigram,
      isFullyOccupied: checkIsFullyOccupied(shifts)
    }

    updateStoreCategoryTags()

    try {
      const listingRef = doc(db, FB_LISTINGS, id)
      await updateDoc(listingRef, listing)
      await updateStoreTags()
      setCancelButtonDisabled(false)
      setAlertLevel('success')
      setAlert('Listing created successfully.')
    } catch (error) {
      setAlertLevel('warning')
      setAlert(errorHandler(error.message))
      setCancelButtonDisabled(false)
    }
  }

  const getSelectedGroup = () => {
    if (isGroupsSettings) {
      for (let i = 0; i < groups.length; i++) {
        if (groups[i].selected === true) {
          return groups[i].id
        }
      }
      return ''
    } else {
      return 'all'
    }
  }

  const checkIsFullyOccupied = (shifts) => {
    const relevantShifts = shifts.filter(shift => {
      const shiftTimestamp = shift.latestApplicationDate
      if (!shiftTimestamp) return true // new shift
      const now = new Date()
      return shiftTimestamp.toDate() > now
    })
    return relevantShifts.every(shift => shift.vacancies === 0)
  }

  const updateStoreTags = async () => {
    if (store.tags) {
      const docRef = doc(db, FB_STORE, store.id)
      await updateDoc(docRef, {
        tags: store.tags,
        updatedAt: new Date()
      })
    }
  }

  const handleUpload = async (id) => {
    if (!selectedPhoto) return

    const storageRef = ref(storage, `${FB_LISTINGS}/${id}`)
    await uploadBytes(storageRef, selectedPhoto)
  }

  const loadCategoryTags = (storeTags, selectedTags, category) => {
    // Load store and selected tags
    const storeCategoryTags = storeTags[category] || []
    const updatedTags = []
    storeCategoryTags.forEach(element => {
      updatedTags.push({ categoryTag: element, selected: selectedTags.includes(element), default: false })
    })

    // Load non-selected default category tags
    defaultCategoryTags[category].forEach(element => {
      if (!checkTagIncluded(element, updatedTags)) {
        updatedTags.push({ categoryTag: element, selected: selectedTags.includes(element), default: true })
      }
    })

    if (updatedTags.length > 0) {
      setBoolCategoryTags(true)
    }
    // Order tags here
    setCategoryTags(updatedTags)
  }

  const checkTagIncluded = (tagName, tagArray) => {
    tagArray.forEach(tag => {
      if (tag.categoryTag === tagName) {
        return true
      }
    })
    return false
  }

  const updateStoreCategoryTags = () => {
    if (category) {
      // const updatedCatTags = categoryTags.map(elem => elem.categoryTag) || []
      const updatedCatTags = categoryTags.filter(elem => elem.default === false).map(elem => elem.categoryTag) || []
      const updatedTags = {
        ...store.tags,
        [category]: updatedCatTags
      }
      store.tags = updatedTags
    }
  }

  // Lifecycle
  useEffect(() => {
    // Load required data
    const fetchData = async () => {
      try {
        const currStore = new Store(currentUser.uid)
        await currStore.fetch()
        setStore(currStore)
        const storeGroups = await currStore.getCorrespondingGroups()
        setStoreGroups(storeGroups)
        const listing = new Listing(id)
        await listing.fetchAll()
        const shiftsData = await listing.getCorrespondingActiveShifts()
        setShifts(shiftsData)
        setDocumentId(listing.id)
        setJobClosingTime(listing.jobClosingTime)
        setAttire(listing.attire)
        setRequirement(listing.requirement)
        setCategory(listing.category)
        setSelectedTags(listing.selectedTags)
        setDefaultCategoryTags({
          fnb: TAG_DEF_FNB,
          retail: TAG_DEF_RET,
          logistics: TAG_DEF_LOG,
          event: TAG_DEF_EVT,
          others: TAG_DEF_OTH
        })
        setSalary(listing.salary.toString())
        setBoolTransport(!!listing.transport)
        setTransport(listing.transport.toString())
        setStreetName(listing.streetName)
        setLat(parseFloat(listing.lat))
        setLng(parseFloat(listing.lng))
        setLocationInfo(listing.locationInfo)
        setSettings(listing.settings)
        const photoFile = await getPhotoFileFromStorage(
          ref(storage, `${FB_LISTINGS}/${listing.id}`)
        )
        setSelectedPhoto(photoFile)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [id, params])

  useEffect(() => {
    if (category && store.tags && selectedTags && !boolCategoryTags) {
      loadCategoryTags(store.tags, selectedTags, category)
    }
  }, [category, store, selectedTags])

  useEffect(() => {
    if (storeGroups.length > 0 && settings !== '') {
      const newGroupList = []
      storeGroups.forEach((group, index) => {
        if (group.id === settings) {
          if (settings === 'all') {
            newGroupList.push({ id: group.id, name: group.name, selected: true, size: 0 })
          } else {
            newGroupList.push({ id: group.id, name: group.name, selected: true, size: 0 })
            setGroupsSettings(true)
          }
        } else {
          newGroupList.push({ id: group.id, name: group.name, selected: false, size: 0 })
        }
      })

      setGroups(newGroupList)
    }
  }, [storeGroups, settings])

  useEffect(() => {
    // Disabling transport bool will set transport to 0
    if (!boolTransport) {
      setTransport('0')
    }
  }, [boolTransport])

  useEffect(() => {
    // Enable listing to be added if required fields complete
    if (
      attire &&
      requirement &&
      category &&
      checkTagSelected() &&
      salary &&
      parseFloat(salary) > 0 &&
      (boolTransport ? boolTransport && transport : true) &&
      streetName &&
      shifts.length > 0
    ) {
      setSaveButtonDisabled(false)
    } else {
      setSaveButtonDisabled(true)
    }
    // Reset alert
    setAlert('')
  }, [
    category,
    categoryTags,
    salary,
    boolTransport,
    transport,
    streetName,
    shifts
  ])

  useEffect(() => {
    let minSalary = '0'
    if (category) {
      minSalary = AVERAGE_SALARIES[category].substring(1, 3)
    }
    setSalary(minSalary)
  }, [category])

  // Frontend
  const Cancel = ActionButton(
    'fas fa-arrow-left listing-cancel',
    'Go back',
    'light',
    handleCancel,
    isCancelButtonDisabled
  )
  const Delete = ActionButton(
    'fas fa-trash',
    'Delete listing',
    'danger',
    handleDelete,
    isSaveButtonDisabled
  )
  const Save = ActionButton('fas fa-upload', 'Save', 'warning', handleSave)
  const Action = ActionBar('edit listing', [Cancel, Delete])
  const Photo = (
    <PhotoUpload
      label='Photo'
      imageSetter={setSelectedPhoto}
      image={selectedPhoto}
    />
  )

  const JobClosingTime = <Dropdown selectedOption={jobClosingTime} setSelected={setJobClosingTime} options={(setJobClosingTimeOptions())} label='Listing End Time' />

  const Attire = (
    <EditField label='Attire:' value={attire} setter={setAttire} />
  )

  const Requirement = (
    <EditField label='Requirement:' value={requirement} setter={setRequirement} />
  )
  const DropdownPlaceholder = {
    value: '',
    label: 'Select a category',
    disabled: true
  }
  const DropdownFnB = {
    value: CATEGORY_FNB,
    label: 'Food and Beverages',
    disabled: false
  }
  const DropdownRetail = {
    value: CATEGORY_RETAIL,
    label: 'Retail',
    disabled: false
  }
  const DropdownLogistics = {
    value: CATEGORY_LOGISTICS,
    label: 'Logistics',
    disabled: false
  }
  const DropdownOthers = {
    value: CATEGORY_OTHERS,
    label: 'Others',
    disabled: false
  }

  const DropdownEvent = {
    value: CATEGORY_EVENT,
    label: 'Event',
    disabled: false
  }

  const Category = (
    <CategoryDropdown
      selectedOption={category}
      setSelected={handleCategoryChange}
      options={[
        DropdownPlaceholder,
        DropdownFnB,
        DropdownRetail,
        DropdownLogistics,
        DropdownEvent,
        DropdownOthers
      ]}
      others={others}
      setOthers={setOthers}
    />
  )

  const CategoryTags = (
    <TagBox
      tags={categoryTags}
      saveTag={handleSaveCategoryTag}
      editTag={handleEditCategoryTag}
      removeTag={handleRemoveCategoryTag}
      title='Job Roles:'
      subtitle='Select all that apply'
      setSelected={handleTagSelection} />)

  const avgSalaryMsg = category ? `Most businesses pay around ${AVERAGE_SALARIES[category]}` : ''

  const Salary = (
    <EditField
      label='Hourly salary (S$):'
      value={salary}
      setter={setSalary}
      type={'number'}
      className='add-listing salary'
      message={avgSalaryMsg}
    />
  )
  const IsTransportCovered = (
    <BooleanField
      isChecked={boolTransport}
      setIsChecked={setBoolTransport}
      label='Worker can claim transportation fee?'
    />
  )
  const Transport = (
    <EditField
      label='Max claimable per shift (S$):'
      value={transport}
      setter={setTransport}
      type='number'
      className={'add-listing salary'}
    />
  )

  const PublishSettings = <SettingsBox
    label='Publish settings'
    isGroupSelected={isGroupsSettings}
    groups={groups}
    settingSelectionHandler={handleSettingSelection}
    groupSelectionHandler={handleGroupSelection}
  />

  const DeleteConfirmation = (
    <Modal show={showDelete} onHide={handleCancelDelete} centered>
      <Modal.Header closeButton></Modal.Header>
      <Modal.Body>
      <div>The Businesses will be subjected to up to 4 hours of pay at the scheduled shift’s standard rate as a cancellation fee if they cancel the shift before 12 hours of the shift, and the below applies for the cancellation. Please take note the cancellation fee will be capped at the number of hours scheduled (e.g., for a 2-hour shift, the cancellation fee would be limited to 2 hours).</div><br></br>
      <div>Between 48 hours and 36 hours before the shift - 1 hour of pay at the scheduled shift’s standard rate</div>
      <div>Between 36 hours and 24 hours before the shift - 2 hours of pay at the scheduled shift’s standard rate</div>
      <div>Between 24 hours and 12 hours before the shift  - 3 hours of pay at the scheduled shift’s standard rate</div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant='secondary' onClick={handleCancelDelete}>
          Cancel
        </Button>
        <Button variant='danger' onClick={handleConfirmDelete}>
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  )

  const footer = <div className='footer' />

  const contextIcons = [
    <PillButton
      key={0}
      icon='fa-rotate-left'
      text='Cancel'
      onClick={() => navigate(ROUTE_MY_LISTINGS)}
      disabled={isCancelButtonDisabled}
    />,
    <PillButton
      key={2}
      icon='fa-trash'
      text='Delete listing'
      onClick={handleDelete}
      bgColor={Colours.red}
      isWhite={true}
    />
  ]

  const render =
    alertLevel === 'success'
      ? (
        <div>
          <Disabler enabled={isCancelButtonDisabled} />
          <PageContainer isDisabler={isCancelButtonDisabled}>
            {Action}
            {Divider()}
            {AlertBar(alert, alertLevel, false)}
          </PageContainer>
        </div>)
      : documentId
        ? (
          <>
            <div>
              <Disabler enabled={isCancelButtonDisabled} />
              <PageContainer
                isDisabler={isCancelButtonDisabled}
                contextIcons={contextIcons}
              >
                {HeaderBar('Edit Listing')}
                <ContentDialog>
                  {AlertBar(alert, alertLevel, false)}
                  {DeleteConfirmation}
                  {Category}
                  {boolCategoryTags && CategoryTags}
                  {JobClosingTime}
                  {Attire}
                  {Requirement}
                  {Photo}
                  {shifts && (
                    <EditShifts
                    setShifts={setShifts}
                    shifts={shifts}
                    listingId={documentId}
                    />
                  )}
                  {Salary}
                  {IsTransportCovered}
                  {boolTransport && Transport}
                  {Divider()}
                  <MapPicker
                    label='Address:'
                    address={streetName}
                    setAddress={setStreetName}
                    setLat={setLat}
                    setLng={setLng}
                    additionalInfo={locationInfo}
                    setInfo={setLocationInfo}
                  />
                  {Divider()}
                  {PublishSettings}
                  {Divider()}
                  {Save}
                </ContentDialog>
                {footer}
              </PageContainer>
            </div>
          </>)
        : (
          <PageContainer>
            <Spinner />
          </PageContainer>)

  return render
}
