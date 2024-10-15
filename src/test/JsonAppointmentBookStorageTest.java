    TODO: Fix memory address difference
    @Test
    public void readAndSaveAppointmentBook_allInOrder_success() throws Exception {
        Path filePath = testFolder.resolve("TempAppointmentBook.json");
        AppointmentBook original = getTypicalAppointmentBook();
        JsonAppointmentBookStorage jsonAppointmentBookStorage = new JsonAppointmentBookStorage(filePath);

        // Save in new file and read back
        jsonAppointmentBookStorage.saveAppointmentBook(original, filePath);
        ReadOnlyAppointmentBook readBack = jsonAppointmentBookStorage.readAppointmentBook(filePath).get();
        assertEquals(original, new AppointmentBook(readBack));

        // Modify data, overwrite existing file, and read back
        Appointment newAppointment = new Appointment(new AppointmentType("Consultation"),
                LocalDateTime.now(), 1, new Sickness("Flu"), new Medicine("Panadol"));
        original.addAppointment(newAppointment);

        // Save updated appointment book
        jsonAppointmentBookStorage.saveAppointmentBook(original, filePath);
        readBack = jsonAppointmentBookStorage.readAppointmentBook(filePath).get();
        assertEquals(original, new AppointmentBook(readBack));

        // Save and read without specifying file path
        jsonAppointmentBookStorage.saveAppointmentBook(original); // file path not specified
        readBack = jsonAppointmentBookStorage.readAppointmentBook().get(); // file path not specified
        assertEquals(original, new AppointmentBook(readBack));
    }
