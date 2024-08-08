import React, { useState, useEffect, useRef } from 'react'
import { Button, Alert, Form, Modal } from 'react-bootstrap'
import './Recyclables.css'
import PropTypes from 'prop-types'
import Sidebar from './Sidebar'
import { storage } from '../firebase/Firebase'
import { ref, getDownloadURL } from 'firebase/storage'
import Topbar, { PillButton } from './Topbar'
import { PLACEHOLDER_LISTING_IMG } from '../reference'
import { Address } from '../listings/ListingUtils'
import { ProfileButton } from '../profile/WorkerProfile'
import Colours from './Colours'
import { TimeDropdown } from './TimeDropdown'
import { Unstable_Popup as BasePopup } from '@mui/base/Unstable_Popup'
import { styled } from '@mui/system'
import { blue, green, orange, purple, red } from '@mui/material/colors'
import { Checkbox, Icon, ToggleButtonGroup } from '@mui/material'
import ToggleButton from '@mui/material/ToggleButton'

export const PageContainer = ({ children, isDisabler, contextIcons, reviews }) => {
  return (
    <div className="parent-container">
      {isDisabler && <Disabler enabled={isDisabler} />}
      <Sidebar reviews={reviews}/>
      <div className="top-bar-and-content">
        <Topbar icons={contextIcons} />
        <div className="content">
          {VerticalGap(5)}
          {children}
        </div>
      </div>
    </div>
  )
}

PageContainer.propTypes = {
  children: PropTypes.node,
  isDisabler: PropTypes.bool,
  contextIcons: PropTypes.array,
  reviews: PropTypes.number
}

export const ActionBar = (title, buttons) => {
  return (
    <div className="action-bar d-flex justify-content-between align-items-start">
      {Title(title)}
      <div className="buttons-group">
        {buttons.map((button, index) => (
          <div key={index} className="button-container">
            {button}
          </div>
        ))}
      </div>
    </div>
  )
}

export const BackButton = () => (
  <div className="pointer back-button">
    <i
      onClick={() => {
        window.history.back()
      }}
      className="fas fa-arrow-left"
    />
  </div>
)

export const HeaderBar = (title, subtitle, hasBackButton = false) => {
  return (
    <div className="action-bar d-flex justify-content-between flex-column">
      <div style={{ width: '100%' }} className="flex-row">
        {hasBackButton && BackButton()}
        {hasBackButton && HorizontalGap()}
        {SmallerTitle(title)}
      </div>
      {subtitle && Subtitle(subtitle)}
    </div>
  )
}

export const SmallerActionBar = (title, buttons, isFlex = false) => {
  const justify = isFlex ? 'justify-content-between' : 'justify-content-start'
  return (
    <div className={`action-bar d-flex ${justify} align-items-start`}>
      {SmallerTitle(title)}
      <div className="buttons-group">
        {buttons.map((button, index) => (
          <div key={index} className="button-container">
            {button}
          </div>
        ))}
      </div>
    </div>
  )
}

export const Title = (title) => <h1 className="page-title">{title}</h1>

export const Subtitle = (subtitle) => (
  <h3 className="page-subtitle">{subtitle}</h3>
)
export const SmallerTitle = (title) => (
  <h1 className="smaller-page-title">{title}</h1>
)

export const Divider = () => <div className="content-divider" />

export const MediumDivider = () => <div className="medium-content-divider" />

export const LongDivider = () => <div className="long-content-divider" />

export const ColumnSpacer = () => <div className='column-spacer' />

export const RowSpacer = () => <div className='row-spacer' />

export const ActionButton = (
  icon,
  label,
  variant,
  handler,
  isDisabled = false
) => {
  return (
    <Button
      disabled={isDisabled}
      onClick={handler}
      variant={variant}
      block={'true'}
      className="secondary-button action-button"
    >
      <i className={`${icon} icon-beside-text`} />
      <span>{label}</span>
    </Button>
  )
}

export const IconButton = (icon, variant, handler, isDisabled = false) => {
  return (
    <Button
      disabled={isDisabled}
      onClick={handler}
      variant={variant}
      className="secondary-button action-button icon-button"
    >
      <i className={`${icon}`} />
    </Button>
  )
}

export const InlineButton = (
  icon,
  label,
  variant,
  handler,
  isDisabled = false
) => {
  return (
    <Button
      disabled={isDisabled}
      onClick={handler}
      variant={variant}
      className="secondary-button action-button inline-button"
    >
      <i className={`${icon} icon-beside-text`} />
      <span>{label}</span>
    </Button>
  )
}

export const AlertBar = (message, color, dismissible = true) => {
  if (message && dismissible) {
    return (
      <Alert variant={color} dismissible>
        {message}
      </Alert>
    )
  }
  if (message && !dismissible) {
    return <Alert variant={color}>{message}</Alert>
  }
  return <div />
}

export const DisplayField = (label, value, onClick) => {
  if (onClick) {
    return (
      <div className="profile-display">
        <div className="profile-label">{label}</div>
        <div className="profile-value can-be-clicked" onClick={onClick}>
          {value}
        </div>
      </div>
    )
  }
  return (
    <div className="profile-display">
      <div className="profile-label">{label}</div>
      <div className="profile-value">{value}</div>
    </div>
  )
}

export const DisplayImageField = (label, value) => {
  return (
    <div>
      <div className="profile-label">{label}</div>
      <div className="image-preview-container">
        <img
          src={
            value || 'https://cdn-icons-png.flaticon.com/128/10412/10412383.png'
          }
        />
      </div>
    </div>
  )
}

export const EditField = ({
  label = '',
  value,
  setter,
  type,
  className,
  placeholder,
  disabled,
  message = ''
}) => {
  const mainLabel = label.split(';')[0]
  const subLabel = label.split(';')[1]
  const handleChange = (event) => {
    setter(event.target.value)
  }
  return (
    <Form.Group>
      <Form.Label>{mainLabel}</Form.Label>
      <p style={{ fontSize: 'smaller', color: 'black' }}>{subLabel}</p>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Form.Control
          className={className}
          type={type || 'text'}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
        />
        <p style={{ marginLeft: '8px', fontSize: 'smaller', color: 'black' }}>
          {message}
        </p>
      </div>
  </Form.Group>
  )
}

EditField.propTypes = {
  label: PropTypes.string,
  sublabel: PropTypes.string,
  value: PropTypes.string.isRequired,
  setter: PropTypes.func.isRequired,
  type: PropTypes.string,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  message: PropTypes.string
}

export const Textbox = ({
  value,
  setter,
  className,
  placeholder,
  disabled
}) => {
  const handleChange = (event) => {
    setter(event.target.value)
  }
  return (
    <Form.Control
      as="textarea"
      className={className}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}

Textbox.propTypes = {
  value: PropTypes.string.isRequired,
  setter: PropTypes.func.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool
}

export const EditFieldLarge = ({ label, value, setter, placeholder }) => {
  return (
    <Form.Group>
      <Form.Label>{label}</Form.Label>
      <textarea
        className="form-textarea form-control"
        value={value}
        onChange={(event) => {
          setter(event.target.value)
        }}
        rows={3}
        placeholder={placeholder}
      />
    </Form.Group>
  )
}

EditFieldLarge.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  setter: PropTypes.func.isRequired,
  placeholder: PropTypes.string
}

export const PhotoUpload = ({ label, imageSetter, image, width, height }) => {
  const [state, setState] = useState(image)

  useEffect(() => {
    setState(image)
  }, [image])

  const ChooseButton = ActionButton(
    'fas fa-camera',
    'Choose Image',
    'warning',
    () => {
      const input = document.getElementById('image-upload')
      input.click()
    },
    false
  )
  const RemoveButton = ActionButton(
    'fas fa-times',
    'Remove Image',
    'danger',
    () => {
      imageSetter(null)
      setState(null)
      document.getElementById('image-upload').value = null
    },
    false
  )
  return (
    <Form.Group>
      <Form.Label>{label}</Form.Label>
      <div>
        <p> Photos of the actual working environment, such as the interior and exterior of the store, are more likely to be taken by workers. </p>
        <input
          style={{ display: 'none' }}
          id="image-upload"
          accept="image/*"
          type="file"
          onChange={(event) => {
            if (event.target.files.length > 0) {
              imageSetter(event.target.files[0])
              setState(event.target.files[0])
            }
          }}
        />

        {state && (
          <div className="image-preview-container">
            {width
              ? DisplayImageField('', URL.createObjectURL(state))
              : DisplayImageField('', URL.createObjectURL(state))}
            {RemoveButton}
          </div>
        )}

        {!state && ChooseButton}
      </div>
      <div className="mb-3" />
    </Form.Group>
  )
}

PhotoUpload.propTypes = {
  label: PropTypes.string.isRequired,
  imageSetter: PropTypes.func.isRequired,
  image: PropTypes.object,
  urlSetter: PropTypes.func,
  width: PropTypes.number,
  height: PropTypes.number
}

export const Image = (path) => (
  <img className="profile-banner" src={path} alt="Banner" />
)

export const Disabler = ({ enabled }) => {
  if (enabled) {
    return (
      <div>
        <div className="overlay" />
        <Spinner />
      </div>
    )
  }
  return <div></div>
}

Disabler.propTypes = {
  enabled: PropTypes.bool.isRequired
}

export const Spinner = () => {
  return (
    <div className="spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export const TextRow = (strings) => {
  return (
    <div className="text-row">
      {strings.map((str, index) => (
        <span key={index}>{str}</span>
      ))}
    </div>
  )
}

export const TagBox = ({ tags, saveTag, removeTag, editTag, title, subtitle, setSelected }) => {
  const [isAddTag, setIsAddTag] = useState(false)
  const [alert, setAlert] = useState('')
  const [alertLevel, setAlertLevel] = useState('warning')
  const [isEditTag, setIsEditTag] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [editedTag, setEditedTag] = useState()

  const handleSaveAddTag = () => {
    const addedTag = { categoryTag: newTag, selected: true, default: false }
    if (isTagNameValid(newTag)) {
      saveTag(addedTag)
      setIsAddTag(false)
    } else {
      setAlert('A tag with this name already exists')
    }
  }

  function isTagNameValid (modifiedTag) {
    let isValid = true
    tags.forEach((tag) => {
      if (tag.categoryTag === modifiedTag.categoryTag) {
        isValid = false
      }
    })
    return isValid
  }

  function handleSaveEditTag () {
    if (isTagNameValid(editedTag.tag)) {
      editTag(editedTag)
      setIsEditTag(false)
    } else {
      setAlert('A tag with this name already exists')
    }
  }
  function handleRemoveTag (tag, index) {
    removeTag(tag, index)
  }

  function handleEditTag (tag, index) {
    setIsEditTag(true)
    setEditedTag({ tag, index })
  }

  function handleCancelEditTag () {
    setIsEditTag(false)
  }

  function handleAddTag () {
    setIsAddTag(true)
  }

  function handleCancelAddTag () {
    setIsAddTag(false)
  }

  function handleTagClick (e) {
    setSelected(e.target.textContent)
  }

  const AddTagModal = () => {
    return (
      <Modal size='lg' show={isAddTag} onHide={handleCancelAddTag}>
        <Modal.Header closeButton>
          <Modal.Title>Create a new tag</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-body'>
        {AlertBar(alert, alertLevel, false)}
          <EditField
            label='Tag Name: '
            value={newTag}
            setter={setNewTag}
            className='add-listing title'
          />
          <ProfileButton
            icon='fa-solid fa-user-plus'
            label={'Save'}
            handler={handleSaveAddTag}
            bgColour={Colours.blue}
            iconColour='#ffffff'
          />
        </Modal.Body>

      </Modal>)
  }

  const EditTagModal = () => {
    function edit (e) {
      setEditedTag({ tag: { ...editedTag.tag, categoryTag: e }, index: editedTag.index })
    }
    return (
      <Modal size='lg' show={isEditTag} onHide={handleCancelEditTag}>
        <Modal.Header closeButton>
          <Modal.Title>Edit a tag</Modal.Title>
        </Modal.Header>
        <Modal.Body className='modal-body'>
          {AlertBar(alert, alertLevel, false)}
          <EditField
            label='Tag Name: '
            value={editedTag ? editedTag.tag.categoryTag : ''}
            setter={edit}
            className='add-listing title'
          />
          <ProfileButton
            icon='fa-solid fa-user-plus'
            label={'Save'}
            handler={handleSaveEditTag}
            bgColour={Colours.blue}
            iconColour='#ffffff'
          />
        </Modal.Body>
      </Modal>)
  }

  return (
    <div className='tag-container'>
      {AddTagModal()}
      {EditTagModal()}
      <div>
        <Form.Label>{title}</Form.Label>
        <p style={{ fontSize: 'smaller', color: 'gray' }}>{subtitle}</p>
      </div>

      <div className='button-row'>
        {tags.map((tag, index) => {
          function onEditTagClick () {
            handleEditTag(tag, index)
          }

          function onRemoveTagClick (e) {
            handleRemoveTag(tag, index)
            e.stopPropagation()
            return false
          }
          return (
            <div key={index} className="button">
              <div hidden={tag.selected}>
                <button className='button-tag big' onClick={handleTagClick}>
                  {tag.categoryTag}
                  <button className='button-tag small edit' onClick={onEditTagClick} hidden={tag.default}>
                    <icon className='fa fa-edit'></icon>
                  </button>
                  <button className='button-tag small remove' onClick={onRemoveTagClick} hidden={tag.default}>
                    <icon className='fa fa-remove'></icon>
                  </button>
                </button>
              </div>
              <div hidden={!tag.selected}>
                <button className="button-tag big selected" onClick={handleTagClick} >
                  {tag.categoryTag}
                  <button className='button-tag small edit' onClick={onEditTagClick} hidden={tag.default}>
                    <icon className='fa fa-edit'></icon>
                  </button>
                  <button className='button-tag small remove' onClick={onRemoveTagClick} hidden={tag.default}>
                    <icon className='fa fa-remove'></icon>
                  </button>
                </button>
              </div>
            </div>
          )
        })
        }
        <div>
          <button className="button-tag new" onClick={handleAddTag}><icon className='fa-thin fa-plus fa-2xl'></icon></button>
        </div>
      </div>

    </div>
  )
}

TagBox.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  tags: PropTypes.array.isRequired,
  saveTag: PropTypes.func.isRequired,
  editTag: PropTypes.func.isRequired,
  setSelected: PropTypes.func,
  removeTag: PropTypes.func.isRequired,
  handleAddTag: PropTypes.func
}

export const CalendarCustomEvent = ({ event }) => {
  return (
    <div className='row calendar-event'>
      <div className='col calendar-event-title'>
        {event.title}
      </div>
      <div className='col calendar-event-applicants'>
      <div className= 'calendar-event-applicants-box'>
        <Icon className='fas fa-user-alt calendar-event-applicant-icon'/>
        {event.workers}
      </div>
      </div>
    </div>
  )
}

CalendarCustomEvent.propTypes = {
  event: PropTypes.object
}

export const CategoryDropdown = ({ selectedOption, setSelected, options, label, others = null, setOthers = null }) => {
  const handleChange = (e) => {
    setSelected(e.target.value)
  }
  const handleChangeOthers = (e) => {
    setOthers(e.target.value)
  }
  const isEditable = selectedOption === 'Others'

  return (
    <div className="form-group selector">
      <div className="select-container">
        <Form.Label>{label === 'Groups' ? '' : 'Category: '}</Form.Label>

        <select
          id="category"
          className="form-control"
          value={selectedOption}
          onChange={handleChange}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* <div className="bi bi-chevron-down"></div> */}
        {selectedOption === 'others'
          ? <textarea
            className="form-control"
            value={others}
            onChange={handleChangeOthers}
          />
          : null}
      </div>
    </div>
  )
}

CategoryDropdown.propTypes = {
  selectedOption: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  label: PropTypes.string,
  others: PropTypes.string,
  setOthers: PropTypes.func
}

export const BreakDropdown = ({ selectedOption, setSelected, options, label, others = null, setOthers = null }) => {
  const handleChange = (e) => {
    setSelected(e.target.value)
  }
  const handleChangeOthers = (e) => {
    setOthers(e.target.value)
  }
  const isEditable = selectedOption === 'Others'

  return (
    <div className="form-group selector">
      <div className="select-container">
        <Form.Label>{label}</Form.Label>
        <select
          id="breakTime"
          className="form-control"
          value={selectedOption}
          onChange={handleChange}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

BreakDropdown.propTypes = {
  selectedOption: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  label: PropTypes.string,
  others: PropTypes.string,
  setOthers: PropTypes.func
}

export const Dropdown = ({ selectedOption, setSelected, options, label, others = null, setOthers = null, disabled = false }) => {
  const handleChange = (e) => {
    setSelected(e.target.value || 0)
  }

  return (
    <div className="form-group selector">
      <div className="select-container">
        <Form.Label>{label}</Form.Label>
        <select
          id="dropdown"
          className="form-control"
          value={selectedOption}
          onChange={handleChange}
          disabled={disabled}
        >
          {options.map((option, index) => (
            <option key={index} value={option.value} selected={option.value === selectedOption}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

Dropdown.propTypes = {
  selectedOption: PropTypes.string.isRequired,
  setSelected: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  label: PropTypes.string,
  others: PropTypes.string,
  setOthers: PropTypes.func,
  disabled: PropTypes.bool
}

export const BooleanField = ({ isChecked, setIsChecked, label }) => {
  const handleChange = (event) => {
    setIsChecked(event.target.checked)
  }
  return (
    <div className="form-check recyclable">
      <label className="checkbox-label">
        <input
          className="form-check-input"
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
        />
        {label}
      </label>
    </div>
  )
}

BooleanField.propTypes = {
  isChecked: PropTypes.bool.isRequired,
  setIsChecked: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired
}

const StyledToggleButtonGroup = (props) => (
  <ToggleButtonGroup
    {...props}
    sx={{
      '& .MuiToggleButtonGroup-grouped': {
        marginLeft: 0,
        marginRight: 2,
        marginTop: 2,
        padding: '0 1',
        '&:not(:first-child)': {
          border: '1px solid',
          borderColor: '#fac000',
          borderRadius: '50%'
        },
        '&:first-child': {
          border: '1px solid',
          borderColor: '#fac000',
          borderRadius: '50%'
        }
      }
    }}
  />
)

const StyledToggle = (props) => (
  <ToggleButton
    {...props}
    sx={{
      color: 'black',
      minWidth: 32,
      maxWidth: 32,
      height: 32,
      textTransform: 'unset',
      fontSize: '0.75rem',
      '&.Mui-selected': {
        color: 'white',
        background: '#fac000'
      },
      '&:hover': {
        borderColor: '#fac000',
        background: '#fac000'
      },
      '&:hover.Mui-selected': {
        borderColor: '#fac000',
        background: '#fac000'
      }
    }}
  />
)

export const DaysChooser = ({ selectedDays, setDays, isEnabled }) => {
  const handleCheckboxChange = (event, newDays) => {
    const newSelectedDays = {
      Mo: false,
      Tu: false,
      We: false,
      Th: false,
      Fr: false,
      Sa: false,
      Su: false
    }

    newDays.forEach((day) => {
      newSelectedDays[day] = true
    })

    setDays(newSelectedDays)
  }

  if (!isEnabled) {
    return <div></div>
  }

  return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'baseline' }}>
        <Form.Label>Recurring Days</Form.Label>
        <StyledToggleButtonGroup
        value={Object.keys(selectedDays).filter((day) => selectedDays[day])}
        onChange={handleCheckboxChange}
        aria-label="day"
        >
        {Object.keys(selectedDays).map((day) => (
          <StyledToggle key={day} value={day}>
            {day}
          </StyledToggle>
        ))}
      </StyledToggleButtonGroup>
      </div>
  )
}

DaysChooser.propTypes = {
  selectedDays: PropTypes.object.isRequired,
  setDays: PropTypes.func.isRequired,
  isEnabled: PropTypes.bool.isRequired
}

export const DateChooser = ({ date, setDate, isEnabled }) => {
  const handleDateChange = (event) => {
    setDate(event.target.value)
  }
  if (!isEnabled) {
    return <div></div>
  }
  return (
    <div>
      <Form.Label>Date</Form.Label>
      <input
        id="dateChooser"
        className="form-control date-chooser"
        type="date"
        value={date}
        onChange={handleDateChange}
      />
    </div>
  )
}

DateChooser.propTypes = {
  date: PropTypes.string.isRequired,
  setDate: PropTypes.func.isRequired,
  isEnabled: PropTypes.bool.isRequired
}

export const TimeChooser = ({
  time,
  setTime,
  label,
  isEnabled,
  isInterval,
  duration,
  isNextDay
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  let originalTime = time

  function handleBlur () {
    if (time === originalTime || !originalTime) {
      return
    }
    if (time.split(':')[0] === originalTime.split(':')[0] || time.split(':')[1] === originalTime.split(':')[1]) {
      return
    }
    originalTime = time
    time && setIsDropdownOpen(false)
  }

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    isEnabled && <div ref={dropdownRef}>
      <Form.Label>{label}</Form.Label>
      <text style={{ color: red[600], marginLeft: 10 }}>
        {isInterval && isNextDay && ' +1 day'}
      </text>
      <div className='row'>
        <div className='col dropdown-field'>
          <input
            id="dateChooser"
            className="form-control time-chooser"
            type="text"
            value={time}
            step="900" // 15 minutes in seconds (15 * 60)
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            onBlur={handleBlur}
            readOnly={true}
          />
          {isDropdownOpen && <TimeDropdown time={time} setTime={setTime} handleClose={(e) => { setIsDropdownOpen(false) }} />}
        </div>
        <div className='col' hidden={!isInterval}>
          <div className='row'>
            {duration}
          </div>
        </div>
      </div>
    </div>
  )
}

TimeChooser.propTypes = {
  time: PropTypes.string,
  isInterval: PropTypes.bool,
  setTime: PropTypes.func.isRequired,
  start: PropTypes.string,
  duration: PropTypes.string,
  isNextDay: PropTypes.bool,
  label: PropTypes.string.isRequired,
  isEnabled: PropTypes.bool.isRequired,
  setUserHasEdited: PropTypes.func
}

export const VacancyChooser = ({ vacancy, setVacancy, label, isEnabled }) => {
  const handleVacancyChange = (event) => {
    setVacancy(parseInt(event.target.value))
  }
  if (!isEnabled) {
    return <div></div>
  }
  return (
    <div>
      <Form.Label>{label}</Form.Label>
      <input
        className="form-control vacancy-chooser"
        type="number"
        value={vacancy}
        onChange={handleVacancyChange}
      />
    </div>
  )
}

VacancyChooser.propTypes = {
  vacancy: PropTypes.number.isRequired,
  setVacancy: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  isEnabled: PropTypes.bool.isRequired
}

export const SettingsBox = ({ label, isGroupSelected, groups, settingSelectionHandler, groupSelectionHandler }) => {
  const handleGroupSelection = (event) => {
    groupSelectionHandler(event.target.value)
  }

  const handleSettingsSelection = (event) => {
    settingSelectionHandler(event.target.value)
  }

  return (
    <div>
      <Form.Label>{label}</Form.Label>
      <div className='settings-container'>
        <div className='settings-container'>
          <Form.Check
            style={{ fontSize: '18px' }}
            inline
            label='All workers'
            value='all'
            checked={!isGroupSelected}
            type='radio'
            onChange={handleSettingsSelection}
          />
        </div>
        <div className='settings-container'>
          <Form.Check
            style={{ fontSize: '18px' }}
            inline
            label='Select group'
            value='group'
            checked={isGroupSelected}
            type='radio'
            onChange={handleSettingsSelection}
          />
        </div>
        <div className='settings-container'>
          <div hidden={!isGroupSelected} className='col'>
            {groups.map((option, index) => (
              <div key={index} className='group-settings-container'>
                <div className='settings-container'>
                  <Form>
                    <Form.Check
                      style={{ fontSize: '18px' }}
                      inline
                      label={option.name}
                      value={option.id}
                      checked={option.selected}
                      type='checkbox'
                      id={option.id}
                      onChange={handleGroupSelection}
                    />
                  </Form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

SettingsBox.propTypes = {
  label: PropTypes.string.isRequired,
  isGroupSelected: PropTypes.bool.isRequired,
  groups: PropTypes.array,
  settingSelectionHandler: PropTypes.func.isRequired,
  groupSelectionHandler: PropTypes.func.isRequired

}

export const ImageStorageDisplay = ({ folder, image, width, height }) => {
  if (!image || image === '') {
    image = PLACEHOLDER_LISTING_IMG
  }
  const [url, setUrl] = useState('')
  getDownloadURL(ref(storage, `${folder}/${image}`)).then((downloadURL) => {
    setUrl(downloadURL)
  })
  return (
    <div className="image-preview-container">
      <img height={height} src={url} alt="Thumb" />
    </div>
  )
}

ImageStorageDisplay.propTypes = {
  folder: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  width: PropTypes.number,
  height: PropTypes.number
}

export const AvatarImage = ({ photo, size }) => {
  const imageUrl = URL.createObjectURL(photo)

  // Style object to hold the height and width if provided
  const imageStyle = {}
  if (size) {
    imageStyle.height = size
    imageStyle.width = size
  }

  return (
    <img
      className="avatar-image"
      src={imageUrl}
      alt="Avatar"
      style={imageStyle} // Apply the style to the <img> element
    />
  )
}

AvatarImage.propTypes = {
  photo: PropTypes.object.isRequired,
  size: PropTypes.number
}

export const RoundedRectImage = ({ photo, size }) => {
  const imageUrl = URL.createObjectURL(photo)

  // Keep to a 4:3 ratio
  const imageStyle = {}
  if (size) {
    imageStyle.height = size
    imageStyle.width = size * 1.33
  }

  return (
    <img
      className="rounded-rect-image"
      src={imageUrl}
      alt="Preview"
      style={imageStyle} // Apply the style to the <img> element
    />
  )
}

RoundedRectImage.propTypes = {
  photo: PropTypes.object.isRequired,
  size: PropTypes.number
}

export const VerticalGap = (num = 1) => {
  const style = {
    minHeight: `${num}rem`
  }
  return <div style={style} />
}

export const HorizontalGap = (num = 1) => {
  const style = {
    minWidth: `${num}rem`
  }
  return <div style={style} />
}

export const ContentDialog = ({
  flex = '0 1 auto',
  width,
  children,
  style
}) => (
  <div className="content-dialog" style={{ flex, width, ...style }}>
    {children}
  </div>
)

ContentDialog.propTypes = {
  flex: PropTypes.string,
  width: PropTypes.number,
  children: PropTypes.node,
  style: PropTypes.object
}

export const ContentDialogUnpadded = ({
  flex = '0 1 auto',
  width,
  children,
  style
}) => {
  return (
    <div
      className="content-dialog"
      style={{ flex, padding: 0, width, ...style }}
    >
      {children}
    </div>
  )
}

ContentDialogUnpadded.propTypes = {
  flex: PropTypes.string,
  width: PropTypes.number,
  children: PropTypes.node,
  style: PropTypes.object
}

export const ContentCard = ({ width, children, style }) => (
  <div className="content-card" style={{ width, ...style }}>
    {children}
  </div>
)

ContentCard.propTypes = {
  flex: PropTypes.string,
  width: PropTypes.number,
  children: PropTypes.node,
  style: PropTypes.object
}

export const DuplicateModal = ({ firstShiftsArray, isOpen, handleClose, handleClickDuplicateListing }) => {
  return (
    <Modal size='lg' show={isOpen} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Choose which listing to duplicate!</Modal.Title>
      </Modal.Header>
      <Modal.Body className='modal-body'>
        {firstShiftsArray.map((item) => {
          return (
            <div
              className='row-member-container'
              onClick={() => handleClickDuplicateListing(item.listing)}
              key={item.listing.id}
            >
              <span className='name'>
                {item.firstShift || item.listing.title}: ${item.listing.salary}/h
              </span>
              <Address streetName={item.listing.streetName} lat={item.listing.lat} lng={item.listing.lng} />
            </div>
          )
        })}
      </Modal.Body>
    </Modal>
  )
}
DuplicateModal.propTypes = {
  firstShiftsArray: PropTypes.array,
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  handleClickDuplicateListing: PropTypes.func.isRequired
}

export const FloatingTextButton = ({ comment, index, isStore }) => {
  const [isDisplayed, setIsDisplayed] = useState(false)
  const [anchor, setAnchor] = useState(null)
  function handleClick (e) {
    setAnchor(anchor ? null : e.currentTarget)
    setIsDisplayed(!isDisplayed)
  }

  const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025'
  }

  const blue = {
    200: '#99CCFF',
    300: '#66B2FF',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    700: '#0066CC'
  }
  const PopupBody = styled('div')(
    ({ theme }) => `
    width: max-content;
    padding: 12px 16px;
    margin: 8px;
    border-radius: 8px;
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    background-color: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    box-shadow: ${theme.palette.mode === 'dark' ? '0px 4px 8px rgb(0 0 0 / 0.7)' : '0px 4px 8px rgb(0 0 0 / 0.1)'
    };
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    z-index: 1;
  `
  )
  return (
    <div hidden={comment === ''}>
      {IconButton('fas fa-comment-dots', 'info', handleClick)}
      <BasePopup id={isDisplayed ? 'simple-popper' : undefined} open={isDisplayed} anchor={anchor}>
        <PopupBody>{comment}</PopupBody>
      </BasePopup>
    </div>
  )
}
FloatingTextButton.propTypes = {
  comment: PropTypes.string,
  index: PropTypes.number,
  isStore: PropTypes.bool
}

export const ColorPickerBox = ({ color, setColor }) => {
  useEffect(() => {
  }, [color])
  const colorOptions = [
    red[400],
    orange[500],
    green[400],
    blue[400],
    purple[400]
  ]

  return (
    <div className='flex-row' style={{ marginTop: 15 }}>
      {colorOptions.map((option) => {
        return (
          <div key={option} className='col'>
            <Checkbox
              style={{
                backgroundColor: option,
                width: '60',
                height: '60'
              }}
              checked={option === color}
              onClick={() => setColor(option)}
              sx={{
                color: option,
                '&.Mui-checked': {
                  color: option
                },
                border: option === color ? 'solid' : '',
                borderWidth: '5',
                borderColor: 'black'
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

ColorPickerBox.propTypes = {
  color: PropTypes.string,
  setColor: PropTypes.func.isRequired
}

export const StoreSelectButton = () => {
  const [isDisplay, setIsDisplay] = useState()

  return (
    <div>
      <PillButton
            icon={'fa-store'}
            text="Store Name"
            onClick={() => {
              setIsDisplay(!isDisplay)
            }}
            bgColor={Colours.yellow}
            isDialog={true}
      ></PillButton>
     {isDisplay && <div>{StoreSelectDialog()}</div>}
    </div>
  )
}

export const StoreSelectDialog = () => {
  const storeList = [
    { name: 'store name A' },
    { name: 'store name A' },
    { name: 'store name A' },
    { name: 'store name A' },
    { name: 'store name A' },
    { name: 'store name A' },
    { name: 'store name A' }
  ]
  return (
    <div className='store-select-dialog'>
      <div className='store-select-header'>
      <div>Select Store:</div>
      <PillButton
            text="Select All"
            onClick={() => {}}
            bgColor={Colours.yellow}
      ></PillButton>
      </div>
      <hr></hr>
      <div className='store-list'>
      {storeList.map((store, index) => (
          <PillButton
          key = {index}
          icon={'fa-store'}
          text= {store.name}
          onClick={() => {}}
          bgColor={Colours.white}
          ></PillButton>
      ))}
      </div>
      <div>
      <div className='store-select-footer'>
      <PillButton
            icon={'fa-plus-circle'}
            text="Add New Store"
            onClick={() => {}}
            bgColor={Colours.yellow}
      ></PillButton>
      </div>
      </div>
      </div>
  )
}
