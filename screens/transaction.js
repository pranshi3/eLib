import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  TextInput,
  Image,
  ImageBackground,
} from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Rajdhani_600SemiBold } from '@expo-google-fonts/rajdhani';
import * as Font from 'expo-font';
import db from '../config'
import firebase from 'firebase'
import { KeyboardAvoidingView } from 'react-native-web';

const bgImage = require('../assets/background2.png');
const appIcon = require('../assets/appIcon.png');
const appName = require('../assets/appName.png');

export default class TransactionScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bookId: '',
      studentId: '',
      domState: 'normal',
      hasCameraPermissions: null,
      scanned: false,
      bookName:'',
      studentName:''
    };
  }
  getCameraPermissions = async (domState) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      //status=='granted' is true when user grants permission or else it's false
      hasCameraPermissions: status == 'granted',
      domState: domState,
      scanned: false,
    });
  };
  handleBarcodeScanned = async ({ type, data }) => {
    const { domState } = this.state;
    if (domState == 'bookId') {
      this.setState({
        bookId: data,
        domState: 'normal',
        scanned: true,
      });
    } else if (domState == 'studentId') {
      this.setState({
        studentId: data,
        domState: 'normal',
        scanned: true,
      });
    }
  };
  handleTransaction=async()=>{
    var {bookId,studentId}= this.state
    await this.getBookDetails(bookId)
    await this.getStudentDetails(studentId)
    var transactionType= await this.checkBookAvailability(bookId)
    if(!transactionType){
      this.setState({
        bookId:'',
        studentId:''
      })
      alert("This book doesn't exist in our library")
    }

    else if(transactionType=='issue'){
      var isEligible=await this.checkStudentEligibilityforBookIssue(studentId)
      if(isEligible){
        var {bookName,studentName}=this.state
        this.initiateBookIssue(bookId,bookName,studentId,studentName)
        alert('book successfully issued to student')
      }
    }
    else{
      var isEligible=await this.checkStudentElibilitiyForBookReturn(bookId,studentId)
      if(isEligible){
        var {bookName,studentName}=this.state
        this.initiateBookReturn(bookId,bookName,studentId,studentName)
        alert('book successfully returned to library')
      }

    }
  
  }



  getBookDetails=(bookId)=>{
    bookId=bookId.trim()
    db.collection('books')
    .where('book_id','==',bookId)
    .get()
    .then((snapshot)=>{snapshot.docs.map((doc)=>{this.setState({
      bookName: doc.data().book_details.book_name
    })})})
  }


  getStudentDetails=(studentId)=>{
studentId=studentId.trim()
db.collection('students')
.where('student_id','==',studentId)
.get()
.then((snapshot)=>{snapshot.docs.map((doc)=>this.setState({
  studentName: doc.data().student_details.student_name
}))})
  }

  initiateBookIssue=async(bookId,bookName,studentId,studentName)=>{

    //adding a new transaction
    db.collection('transactions').add({
      student_id: studentId,
      student_name:studentName,
      book_id:bookId,
      book_name:bookName,
      date: firebase.firestore.Timestamp.now().toDate(),
      transaction_type:'issue'
    })
    //changing book status
    db.collection('books')
    .doc(bookId)
    .update({
      is_book_available:false
    })
    //changing the number of books issued by student
    db.collection('students')
    .doc(studentId)
    .update({
      number_of_books_issued: firebase.firestore.FieldValue.increment(1)
    })
    console.log('working')
    //updating the local variables in this.state so that they are empty/ready to accept new transactions
    this.setState({
      bookId:'',
      studentId:''
    })
    }
  

  initiateBookReturn=(bookId,bookName,studentId,studentName)=>{
db.collection('transactions').add({
  student_id: studentId,
  student_name:studentName,
  book_id:bookId,
  book_name:bookName,
  date: firebase.firestore.Timestamp.now().toDate(),
  transaction_type:'return'
})
db.collection('books')
.doc(bookId)
.update({
  is_book_available:true
})
db.collection('students')
.doc(studentId)
.update({
  number_of_books_issued:firebase.firestore.FieldValue.increment(-1)
})
this.setState({
  bookId:'',
  studentId:''
})
  }

checkBookAvailability=async(bookId)=>{
  const bookRef= await db.collection('books')
  .where('book_id', '==', bookId)
  .get()

  var transactionType=''
  if (bookRef.docs.length==0){
    transactionType=false
  }
  else{
    bookRef.docs.map((doc)=>{
      transactionType=doc.data().is_book_available ? 'issue' : 'return'
    })
  }
  return transactionType
}

checkStudentEligibilityforBookIssue=async(studentId)=>{
  const studentRef= await db.collection('students')
  .where('student_id','==',studentId)
  .get()

var isStudentEligible=''
if(studentRef.docs.length==0){
  this.setState({
    bookId:'',
    studentId:''
  })
  isStudentEligible=false
  alert("This student doesn't exist in our database")
}
else{
  studentRef.docs.map((doc)=>{
    if (doc.data().number_of_books_issued < 3){
      isStudentEligible=true
    }
    else{
      isStudentEligible=false
      this.setState({
        bookId:'',
        studentId:''
      })
      alert('Student can not issue more than 3 books')
    }
  })
}

return isStudentEligible
}

checkStudentElibilitiyForBookReturn=async(bookId,studentId)=>{
  const transactionRef=await db.collection('transactions')
  .where('book_id','==',bookId)
  .limit(1)
  .get()

  var isStudentEligible=''
  transactionRef.docs.map((doc)=>{
    var lastBookTransaction=doc.data()
    console.log(lastBookTransaction.student_id)
    if(lastBookTransaction.student_id== studentId){
      isStudentEligible=true
    }
    else{
      isStudentEligible=false
      this.setState({
        bookId:'',
        studentId:''
      })
      alert('This book was not issued by this student')
    }
  })
  return isStudentEligible
  
}


  render() {
    const { domState, hasCameraPermissions, scanned, bookId, studentId } =
      this.state;
    if (domState !== 'normal') {
      return (
        <BarCodeScanner
          onBarcodeScanned={scanned ? undefined : this.handleBarcodeScanned}
          styles={StyleSheet.absoluteFillObject}
        />
      );
    } else {
      return (
        <KeyboardAvoidingView behavior='padding' style={styles.container}>
          <ImageBackground source={bgImage} style={styles.bgImage}>
            <View style={styles.upperContainer}>
              <Image source={appIcon} style={styles.appIcon} />
              <Image source={appName} style={styles.appName} />
            </View>
            <View style={styles.lowerContainer}>
              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Book ID"
                  placeholderTextColor="white"
                  value={bookId}
                  onChangeText={(text)=>{this.setState({bookId:text})}}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => this.getCameraPermissions('bookId')}>
                  <Text style={styles.scanButtonText}>Scan QR Code</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.textInputContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Student ID"
                  placeholderTextColor="white"
                  value={studentId}
                  onChangeText={(text)=>{this.setState({studentId:text})}}
                />
                <TouchableOpacity
                  style={styles.scanButton}
                  onPress={() => this.getCameraPermissions('studentId')}>
                  <Text style={styles.scanButtonText}>Scan QR Code</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.text} onPress={this.handleTransaction}>
                <Text style={styles.submitButtonText}> Submit </Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </KeyboardAvoidingView>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B65FCF',
  },
  upperContainer: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowerContainer: {
    flex: 0.5,
    alignItems: 'center',
  },
  textInputContainer: {
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: 'row',
    backgroundColor: 'lightpink',
    borderColor: 'white',
  },
  textInput: {
    width: '60%',
    height: 50,
    borderColor: 'white',
    borderRadius: 10,
    borderWidth: 3,
    fontSize: 20,
    backgroundColor: 'lightblue',
    fontFamily: 'Rajdhani_600SemiBold',
    color: 'white',
  },

  scanButton: {
    width: 145,
    height: 50,
    backgroundColor: 'lightgreen',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    fontSize: 20,
    color: 'white',
    fontFamily: 'Rajdhani_600SemiBold',
  },
  bgImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  appIcon: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginTop: 60,
  },
  appName: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  text: {
    width: '80%',
    height: 50,
    marginTop: 30,
    justifyContent: 'center',
    backgroundColor: 'lightpink',
    borderRadius: 30,
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 20,
    fontFamily:'Rajdhani_600SemiBold'
  },
});
