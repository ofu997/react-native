// clientType selection + narrative box scroll
import Feather from "@expo/vector-icons/Feather";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import Checkbox from "expo-checkbox";
import { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CONFIG from "../../config";
import { childAPI, parentAPI, teamAPI } from "../../hooks/useHemaiyaData";
import { cachedFetch } from "../../utils/api_Hemaiya";

const DropdownField = ({
  label,
  data,
  value,
  onChange,
  isFocus,
  setIsFocus,
  customDropdownPosition,
}) => (
  <SafeAreaView>
    <Text style={styles.label}>{label}</Text>
    <Dropdown
      style={styles.input}
      placeholder={!isFocus ? `Select Item` : "..."}
      data={data}
      maxHeight={300}
      labelField="label"
      valueField="value"
      value={value}
      placeholderStyle={{ color: "#929292" }}
      onChange={(item) => onChange(item.value)}
      onFocus={() => setIsFocus(true)}
      onBlur={() => setIsFocus(false)}
      dropdownPosition={customDropdownPosition || "auto"}
    />
  </SafeAreaView>
);

const AddCaseNotes = ({ navigation }) => {
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { caseId, childId, isPrevention } = route.params || {};

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [otherAttendees, setOtherAttendees] = useState("");

  const [teamMember, setTeamMember] = useState("");
  const [teamMemberFocus, setTeamMemberFocus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Client fields
  const [clientType, setClientType] = useState(null); // 0=Child, 1=Parent, 2=Other
  const [child, setChild] = useState(null);
  const [childFocus, setChildFocus] = useState(false);
  const [parent, setParent] = useState(null);
  const [parentFocus, setParentFocus] = useState(false);
  const [other, setOther] = useState("");

  // --- Service fields
  const [serviceType, setServiceType] = useState(null);
  const [contactType, setContactType] = useState(null);
  const [location, setLocation] = useState(null);
  const [appointmentStatus, setAppointmentStatus] = useState(null);

  const [serviceFocus, setServiceFocus] = useState(false);
  const [contactFocus, setContactFocus] = useState(false);
  const [locationFocus, setLocationFocus] = useState(false);
  const [appointmentFocus, setAppointmentFocus] = useState(false);
  const [durationFocus, setDurationFocus] = useState(false);

  const [notifyTeam, setNotifyTeam] = useState(0);
  const [isCompleted, setIsCompleted] = useState(0);
  const [errors, setErrors] = useState({});

  // Narrative (plain text)
  const [narrative, setNarrative] = useState("");

  // Dates/times
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [nextApptDate, setNextApptDate] = useState(null);
  const [nextApptTime, setNextApptTime] = useState(null);
  const [duration, setDuration] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [pickerTarget, setPickerTarget] = useState("");

  // #region Dropdown data
  const serviceData = [
    { label: "Child and Family Team", value: 1 },
    { label: "Residential Placement", value: 2 },
    { label: "Treatment Contract", value: 3 },
    { label: "N/A", value: 4 },
    { label: "Placement Contact", value: 5 },
    { label: "Parent Contact", value: 6 },
    { label: "Child Contact", value: 7 },
    { label: "Support Meeting", value: 8 },
    { label: "Court", value: 9 },
    { label: "Transportation", value: 10 },
    { label: "Supervised Visit", value: 11 },
    { label: "Medical", value: 12 },
    { label: "BH Contact (For Therapy)", value: 13 },
    { label: "School Contact", value: 14 },
    { label: "PIP", value: 15 },
    { label: "Obtaining Community Resources", value: 16 },
    { label: "General Case Management", value: 17 },
    { label: "Staffing with Supervisor", value: 18 },
    { label: "Staffing with Group", value: 19 },
    { label: "Legal", value: 20 },
    { label: "Closing Summary", value: 21 },
    { label: "PAP", value: 22 },
    { label: "Wizards and Fairies", value: 23 },
    { label: "Update Case Plan", value: 24 },
    { label: "Home Visit", value: 25 },
    { label: "Home Study", value: 26 },
  ];

  const contactData = [
    { label: "Phone", value: 1 },
    { label: "Face to Face", value: 2 },
    { label: "Email", value: 3 },
    { label: "Text", value: 4 },
    { label: "N/A", value: 5 },
    { label: "Letter", value: 6 },
    { label: "Virtual", value: 7 },
    { label: "Note to File", value: 8 },
    { label: "Staffing", value: 9 },
  ];

  const locationData = [
    { label: "Home", value: 1 },
    { label: "Office", value: 2 },
    { label: "Relatives Home", value: 3 },
    { label: "School", value: 4 },
    { label: "Community Home", value: 5 },
    { label: "Foster Care", value: 6 },
    { label: "Therapeutic Foster Care", value: 7 },
    { label: "Work", value: 8 },
    { label: "Not Applicable", value: 9 },
    { label: "Jail/Prison", value: 10 },
    { label: "Hospital", value: 11 },
    { label: "Court", value: 12 },
    { label: "Placement Location", value: 13 },
  ];

  const appointmentStatusData = [
    { label: "Attended", value: 1 },
    { label: "Cancel By client", value: 2 },
    { label: "Cancel By provider", value: 3 },
    { label: "Cancel By FSP", value: 4 },
    { label: "No Show", value: 5 },
    { label: "Unable to See/Other", value: 6 },
    { label: "N/A", value: 7 },
    { label: "Scheduled", value: 8 },
  ];

  const durationData = [
    { label: "NA", value: 0 },
    { label: "15 mins", value: 15 },
    { label: "30 mins", value: 30 },
    { label: "45 mins", value: 45 },
    { label: "60 mins", value: 60 },
    { label: "1 Hour 15 mins", value: 75 },
    { label: "1 Hour 30 mins", value: 90 },
    { label: "1 Hour 45 mins", value: 105 },
    { label: "2 Hours", value: 120 },
    { label: "2 Hours 15 mins", value: 135 },
    { label: "2 Hours 30 mins", value: 150 },
    { label: "2 Hours 45 mins", value: 165 },
    { label: "3 Hours", value: 180 },
    { label: "4 Hours", value: 240 },
    { label: "5 Hours", value: 300 },
  ];
  // #endregion

  const fetchUserData = async () => {
    try {
      const storedDataOrig = await axios.get("userData");
      const storedData = await localStorage.getItem('userData');
      if (storedData) {
        const parsed = JSON.parse(storedData);
        setUserId(parsed.Id);
        setUserName(parsed.LoginId);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const { childData } = childAPI(caseId);
  const childOptions =
    childData?.map((c) => ({ label: c.DescriptionFormatted, value: c.Id })) ||
    [];

  const { parentData } = parentAPI(caseId);
  const parentOptions =
    parentData?.map((p) => ({ label: p.Name, value: p.ParentId })) || [];

  const { teamData } = teamAPI(caseId);
  const teamOptions =
    teamData?.map((t) => ({
      label: t.FullNameFormatted,
      value: t.Id,
    })) || [];

  // Default team member to current user when team options are loaded
  useEffect(() => {
    console.log("--------------------------------");
    console.log("teamOptions", teamOptions);
    console.log("userId", userId);
    console.log("teamMember", teamMember);
    if (teamOptions.length > 0 && !teamMember && userId) {
      const matched = teamOptions.find(
        (t) => t.value.toString() === userId.toString()
      );
      if (matched) {
        setTeamMember(matched.value);
      }
    }
  }, [teamOptions, userId, teamMember]);

  // --- selection handlers that set clientType
  const handleSelectChild = (id) => {
    setChild(id);
    setClientType(0);
  };

  const handleSelectParent = (id) => {
    setParent(id);
    setClientType(1);
  };

  const handleOtherChange = (text) => {
    setOther(text);
    if (text && text.trim().length > 0) {
      setClientType(2);
    } else if (!child && !parent) {
      setClientType(null);
    }
  };

  const refreshCache = async () => {
    try {
      cachedFetch.clearCache(`CaseNoteByCaseId/${caseId}`);
      const [freshResults] = await Promise.all([
        cachedFetch.get(`CaseNoteByCaseId/${caseId}`),
      ]);
      return { freshResults };
    } catch (error) {
      throw error;
    }
  };

  // date/time formatting helpers - consistent with other files
  const formatDateForAPI = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
    // Use local date components to avoid timezone issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // YYYY-MM-DD format
  };

  const formatTimeForAPI = (time) => {
    if (!time || !(time instanceof Date) || isNaN(time.getTime())) return null;
    return time.toTimeString().split(" ")[0]; // HH:MM:SS format
  };

  const handleSubmit = async () => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

    // Build one payload per client present (max 3)
    const entries = [];
    if (child) {
      entries.push({
        clientType: 0,
        payload: {
          appUserId: teamMember ?? userId,
          RecordedBy: userName,
          RecordedOn: currentDate,
          CreatedBy: userName,
          CreatedOn: currentDate,
          childId: child,
          parentId: null,
          clientType: 0,
          otherClientName: "",
          eventDate: formatDateForAPI(selectedDate),
          eventTime: formatTimeForAPI(selectedTime),
          locationLookupId: location,
          eventStatusLookupId: appointmentStatus,
          caseNoteContactTypeLookupId: contactType,
          recipients: otherAttendees || "",
          notes: narrative,
          notifyAll: notifyTeam === 1,
          isCompleted: isCompleted === 1,
          eventSubType: "",
          eventCategory: "",
          isDeleted: false,
          nextAppointmentDate: formatDateForAPI(nextApptDate),
          nextAppointmentTime: formatTimeForAPI(nextApptTime),
          selectedClientIDs: String(child),
          selectedParentIDs: "",
          caseId: caseId,
          caseEventLookupId: serviceType,
          wellChildCheckup: false,
          group: 1,
          serviceGoalId: null,
          Duration: duration ?? 0,
          //people: teamMember ?? null,
          //teamMemberId: teamMember ?? null,
        },
      });
    }

    if (parent) {
      entries.push({
        clientType: 1,
        payload: {
          appUserId: teamMember ?? userId,
          RecordedBy: userName,
          RecordedOn: currentDate,
          CreatedBy: userName,
          CreatedOn: currentDate,
          childId: null,
          parentId: parent,
          clientType: 1,
          otherClientName: "",
          eventDate: formatDateForAPI(selectedDate),
          eventTime: formatTimeForAPI(selectedTime),
          locationLookupId: location,
          eventStatusLookupId: appointmentStatus,
          caseNoteContactTypeLookupId: contactType,
          recipients: otherAttendees || "",
          notes: narrative,
          notifyAll: notifyTeam === 1,
          isCompleted: isCompleted === 1,
          eventSubType: "",
          eventCategory: "",
          isDeleted: false,
          nextAppointmentDate: formatDateForAPI(nextApptDate),
          nextAppointmentTime: formatTimeForAPI(nextApptTime),
          selectedClientIDs: "",
          selectedParentIDs: String(parent),
          caseId: caseId,
          caseEventLookupId: serviceType,
          wellChildCheckup: false,
          group: 1,
          serviceGoalId: null,
          Duration: duration ?? 0,
          //people: teamMember ?? null,
          //teamMemberId: teamMember ?? null,
        },
      });
    }

    if (other && other.trim()) {
      const otherName = other.trim();
      entries.push({
        clientType: 2,
        payload: {
          appUserId: teamMember ?? userId,
          RecordedBy: userName,
          RecordedOn: currentDate,
          CreatedBy: userName,
          CreatedOn: currentDate,
          childId: null,
          parentId: null,
          clientType: 2,
          otherClientName: otherName,
          eventDate: formatDateForAPI(selectedDate),
          eventTime: formatTimeForAPI(selectedTime),
          locationLookupId: location,
          eventStatusLookupId: appointmentStatus,
          caseNoteContactTypeLookupId: contactType,
          recipients: otherAttendees || "",
          notes: narrative,
          notifyAll: notifyTeam === 1,
          isCompleted: isCompleted === 1,
          eventSubType: "",
          eventCategory: "",
          isDeleted: false,
          nextAppointmentDate: formatDateForAPI(nextApptDate),
          nextAppointmentTime: formatTimeForAPI(nextApptTime),
          selectedClientIDs: "",
          selectedParentIDs: "",
          caseId: caseId,
          caseEventLookupId: serviceType,
          wellChildCheckup: false,
          group: 1,
          serviceGoalId: null,
          Duration: duration ?? 0,
          //people: teamMember ?? null,
          //teamMemberId: teamMember ?? null,
        },
      });
    }

    try {
      await Promise.all(
        entries.map((e) =>
          axios.post(`${CONFIG.API_Hemaiya}/CreateNote`, e.payload, {
            headers: { "Content-Type": "application/json" },
          })
        )
      );

      await refreshCache();
      Alert.alert(
        "Success",
        `${entries.length} case note${entries.length > 1 ? "s" : ""} added.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      if (error.response) {
      } else if (error.request) {
      } else {
      }
      Alert.alert(
        "Error",
        "Failed to add all notes. Some may have succeeded. Please check."
      );
    }
  };

  const handleSubmitWrapper = async () => {
    const newErrors = {};
    if (!serviceType) newErrors.serviceType = "Service Type is required.";
    if (!contactType) newErrors.contactType = "Contact Type is required.";
    if (!location) newErrors.location = "Location is required.";
    if (!appointmentStatus)
      newErrors.appointmentStatus = "Appointment Status is required.";
    if (!selectedDate) newErrors.date = "Date is required.";
    if (!child && !parent && !(other && other.trim())) {
      newErrors.clientType =
        "Please add at least one: Child, Parent, or Other.";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    if (isSaving) return;
    setIsSaving(true);
    await handleSubmit();
    setTimeout(() => setIsSaving(false), 1000);
  };

  return (
    <View
      style={[
        styles.container,
        Platform.OS === "android" && {
          paddingTop: StatusBar.currentHeight || 0,
        },
      ]}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#333" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.heading}>Add Case Note</Text>
              <Text style={styles.subtitle}>
                Create a new case note for this case
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          onScrollBeginDrag={() => Keyboard.dismiss()}
        >
          <View style={styles.caseDetails}>
            <Text style={styles.title}>Case Details</Text>

            {/* Child */}
            <View>
              <DropdownField
                label={
                  <Text>
                    Child Name<Text style={{ color: "red" }}>*</Text>
                  </Text>
                }
                data={childOptions}
                value={child}
                onChange={handleSelectChild}
                isFocus={childFocus}
                setIsFocus={setChildFocus}
              />
              {errors.child && (
                <Text style={{ color: "red" }}>{errors.child}</Text>
              )}
            </View>

            {/* Parent */}
            <View>
              <DropdownField
                label={
                  <Text>
                    Parent Name<Text style={{ color: "red" }}>*</Text>
                  </Text>
                }
                data={parentOptions}
                value={parent}
                onChange={handleSelectParent}
                isFocus={parentFocus}
                setIsFocus={setParentFocus}
              />
              {errors.parent && (
                <Text style={{ color: "red" }}>{errors.parent}</Text>
              )}
            </View>

            {/* Other */}
            <View>
              <Text style={styles.label}>Other Client Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Other Client Name"
                value={other}
                onChangeText={handleOtherChange}
                placeholderTextColor={"#929292"}
              />
              {errors.other && (
                <Text style={{ color: "red" }}>{errors.other}</Text>
              )}
            </View>

            {errors.clientType && (
              <Text style={{ color: "red" }}>{errors.clientType}</Text>
            )}

            {/* Date & Time */}
            <View style={styles.dateTimeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>
                  Date<Text style={{ color: "red" }}>*</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickerTarget("currentDate");
                    setDatePickerVisibility(true);
                  }}
                  style={styles.dateTimePicker}
                >
                  <Text style={styles.dateTimeText}>
                    {selectedDate
                      ? selectedDate.toLocaleDateString()
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>
                {errors.date && (
                  <Text style={{ color: "red" }}>{errors.date}</Text>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickerTarget("currentTime");
                    setTimePickerVisibility(true);
                  }}
                  style={styles.dateTimePicker}
                >
                  <Text style={styles.dateTimeText}>
                    {selectedTime
                      ? selectedTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Select Time"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <DropdownField
                label={<Text>Duration</Text>}
                data={durationData}
                value={duration}
                onChange={setDuration}
                isFocus={durationFocus}
                setIsFocus={setDurationFocus}
              />
            </View>
          </View>

          <View style={styles.serviceDetails}>
            <Text style={styles.title}>Service Details</Text>

            <View>
              <DropdownField
                label={
                  <Text>
                    Service Type<Text style={{ color: "red" }}>*</Text>
                  </Text>
                }
                data={serviceData}
                value={serviceType}
                onChange={setServiceType}
                isFocus={serviceFocus}
                setIsFocus={setServiceFocus}
              />
              {errors.serviceType && (
                <Text style={{ color: "red" }}>{errors.serviceType}</Text>
              )}
            </View>

            <View>
              <DropdownField
                label={
                  <Text>
                    Contact Type<Text style={{ color: "red" }}>*</Text>
                  </Text>
                }
                data={contactData}
                value={contactType}
                onChange={setContactType}
                isFocus={contactFocus}
                setIsFocus={setContactFocus}
              />
              {errors.contactType && (
                <Text style={{ color: "red" }}>{errors.contactType}</Text>
              )}
            </View>

            <View>
              <DropdownField
                label={
                  <Text>
                    Location<Text style={{ color: "red" }}>*</Text>
                  </Text>
                }
                data={locationData}
                value={location}
                onChange={setLocation}
                isFocus={locationFocus}
                setIsFocus={setLocationFocus}
              />
              {errors.location && (
                <Text style={{ color: "red" }}>{errors.location}</Text>
              )}
            </View>

            <View>
              <DropdownField
                label={
                  <Text>
                    Appointment Status<Text style={{ color: "red" }}>*</Text>
                  </Text>
                }
                data={appointmentStatusData}
                value={appointmentStatus}
                onChange={setAppointmentStatus}
                isFocus={appointmentFocus}
                setIsFocus={setAppointmentFocus}
              />
              {errors.appointmentStatus && (
                <Text style={{ color: "red" }}>{errors.appointmentStatus}</Text>
              )}
            </View>

            {/* Narrative (TextInput replacement) */}
            <View style={{ marginBottom: 12, flex: 1 }}>
              <Text style={styles.label}>Narrative</Text>
              <View
                style={{
                  borderColor: "#ccc",
                  borderWidth: 1,
                  borderRadius: 8,
                  minHeight: 120,
                  maxHeight: 200,
                  overflow: "hidden",
                }}
              >
                <TextInput
                  style={styles.narrativeInput}
                  placeholder="Enter comments…"
                  placeholderTextColor="#B0B0B0"
                  value={narrative}
                  onChangeText={setNarrative}
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  scrollEnabled
                />
              </View>
              <Text style={styles.charCount}>
                {narrative.length} characters
              </Text>
            </View>

            <View>
              <Text style={styles.label}>Other Attendees</Text>
              <TextInput
                style={styles.input}
                placeholder="Other Attendees"
                value={otherAttendees}
                onChangeText={setOtherAttendees}
                placeholderTextColor={"#929292"}
              />
            </View>
          </View>

          <View style={styles.followUpDetails}>
            <Text style={styles.title}>Follow Up Details</Text>

            <View className="dateTimeRow" style={styles.dateTimeRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Next Appt Date</Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickerTarget("nextDate");
                    setDatePickerVisibility(true);
                  }}
                  style={styles.dateTimePicker}
                >
                  <Text style={styles.dateTimeText}>
                    {nextApptDate
                      ? nextApptDate.toLocaleDateString()
                      : "Select Date"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Next Appt Time</Text>
                <TouchableOpacity
                  onPress={() => {
                    setPickerTarget("nextTime");
                    setTimePickerVisibility(true);
                  }}
                  style={styles.dateTimePicker}
                >
                  <Text style={styles.dateTimeText}>
                    {nextApptTime
                      ? nextApptTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Select Time"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <DropdownField
                label={<Text>Team Member</Text>}
                data={teamOptions}
                value={teamMember}
                onChange={setTeamMember}
                isFocus={teamMemberFocus}
                setIsFocus={setTeamMemberFocus}
                customDropdownPosition="top"
              />
            </View>

            <View style={styles.checkUp}>
              <Checkbox
                style={styles.checkbox}
                value={notifyTeam === 1}
                onValueChange={(v) => setNotifyTeam(v ? 1 : 0)}
              />
              <Text style={styles.checkUpText}>
                Notify all team members about this note
              </Text>
            </View>

            <View style={styles.checkUp}>
              <Checkbox
                style={styles.checkbox}
                value={isCompleted === 1}
                onValueChange={(v) => setIsCompleted(v ? 1 : 0)}
              />
              <Text style={styles.checkUpText}>Mark as completed</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSubmitWrapper}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={(date) => {
              if (pickerTarget === "currentDate") setSelectedDate(date);
              else if (pickerTarget === "nextDate") setNextApptDate(date);
              setDatePickerVisibility(false);
            }}
            onCancel={() => setDatePickerVisibility(false)}
          />

          <DateTimePickerModal
            isVisible={isTimePickerVisible}
            mode="time"
            onConfirm={(time) => {
              if (pickerTarget === "currentTime") setSelectedTime(time);
              else if (pickerTarget === "nextTime") setNextApptTime(time);
              setTimePickerVisibility(false);
            }}
            onCancel={() => setTimePickerVisibility(false)}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#fff",
  },
  headerSection: {
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 60 : 10,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6c757d",
  },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8 },
  dateTimeRow: { flexDirection: "row", gap: 10 },
  dateTimePicker: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },
  dateTimeText: { color: "#929292" },
  label: { marginBottom: 5, fontSize: 14, color: "#444", fontWeight: "500" },
  serviceDetails: { gap: 10, margin: 10, padding: 10 },
  caseDetails: { gap: 10, margin: 10, padding: 10 },
  followUpDetails: { gap: 10, margin: 10, padding: 10 },
  checkUp: {
    display: "flex",
    flexDirection: "row",
    margin: 5,
    gap: 10,
    alignItems: "center",
  },
  checkUpText: { fontSize: 14, fontWeight: "500" },
  checkbox: { borderColor: "#929292", borderRadius: 3 },
  saveButton: {
    backgroundColor: "#5261FF",
    borderRadius: 5,
    padding: 10,
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 30,
  },
  saveButtonText: { color: "#fff", fontWeight: "bold" },
  // Narrative TextInput styles
  narrativeInput: {
    minHeight: 200,
    maxHeight: 200,
    padding: 10,
    fontSize: 16,
    color: "#000",
  },
  charCount: {
    alignSelf: "flex-end",
    color: "#707070",
    fontSize: 12,
    marginTop: 6,
  },
});

export default AddCaseNotes;
