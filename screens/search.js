import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity,FlatList,TextInput } from 'react-native';
import {ListItem,Icon} from 'react-native-elements'
import db from '../config'

export default class SearchScreen extends React.Component{
    constructor(props){
        super(props)
        this.state={
            allTransactions:[],
            searchText:'',
            lastVisibleTransaction:null
        }
    }
    getTransactions=()=>{
        db.collection('transactions')
        .limit(7)
        .get()
        .then((snapshot)=>{
            snapshot.docs.map((doc)=>{
                //console.log(doc.data().date.toDate().toString().split(' ').splice(0,4).join())
                this.setState({
                    allTransactions:[...this.state.allTransactions,doc.data()],
                    lastVisibleTransaction:doc
                })
            })
        })
    }
    componentDidMount(){
        this.getTransactions()
    }

    handleSearch=async(text)=>{
        var textEntered=text.toUpperCase().split('')
        text=text.toUpperCase()
        this.setState({
            allTransactions:[]
        })
        if(!text){
        this.getTransactions()
        }
        if(textEntered[0]=='B'){
            db.collection('transactions')
            .where('book_id','==',text)
            .get()
            .then((snapshot)=>
            {snapshot.docs.map((doc)=>
            {this.setState(
            {allTransactions:[...this.state.allTransactions,doc.data()]})})})
        }
        else if(textEntered[0]=='S'){
            db.collection('transactions')
            .where('student_id','==',text)
            .get()
            .then((snapshot)=>{
                snapshot.docs.map((doc)=>{
                    this.setState({
                        allTransactions:[...this.state.allTransactions,doc.data()]
                    })
                })
            })
        }
        }

    fetchMoreTransactions=async(text)=>{
        var textEntered=text.toUpperCase().split('')
        text=text.toUpperCase()


        const {lastVisibleTransaction,allTransactions}= this.state
        if(textEntered[0]=='B'){
            const query= await db.collection('transactions')
            .where('book_id','==',text)
            .startAfter(lastVisibleTransaction)
            .limit(7)
            .get()
            query.docs.map((doc)=>
            {this.setState(
            {allTransactions:[...this.state.allTransactions,doc.data()],
            lastVisibleTransaction:doc
            })})
        }
        else if(textEntered[0]=='S'){
            db.collection('transactions')
            .where('student_id','==',text)
            .get()
                query.docs.map((doc)=>{
                    this.setState({
                        allTransactions:[...this.state.allTransactions,doc.data()],
                        lastVisibleTransaction:doc
                    })
                })
            }
    }  
    renderItem=({item,i})=>{
        var date= item.date
        .toDate()
        .toString()
        .split(' ')
        .splice(0,4)
        .join(' ')

        var transactionType=item.transaction_type =='issue' ? 'issued' : 'returned'
        return(
            <View style={{borderWidth:1}}>
                <ListItem key={i} bottomDivider>
                    <Icon type={'antdesign'} name={'book'} size={40}/>
                    <ListItem.Content>
                        <ListItem.Title style={styles.title}>
                        {`${item.book_name} (${item.book_id})`}
                        </ListItem.Title>
                        <ListItem.Subtitle style={styles.subtitle}>
                            {`This book was ${transactionType} by ${item.student_name} ${item.student_id}`}
                        </ListItem.Subtitle>
                        <View style={styles.lowerLeftContainer}>
                            <View style={styles.transactionContainer}>
                            <Text style={[styles.transactionText, {color:item.transaction_type=='issue' ? '#78D304':'#0364F4'}]}>
                                {item.transaction_type.charAt(0).toUpperCase()+item.transaction_type.slice(1)}
                            </Text>
                            <Icon 
                            type={'ionicon'} 
                            name={
                                item.transaction_type=='issue'
                                ? 'checkmark-circle-outline'
                                : 'arrow-redo-circle-outline'
                            }
                            />
                            </View>
                            <Text style={styles.date}>
                            {date}
                            </Text>
                        </View>
                    </ListItem.Content>
                </ListItem>
            </View>
        )
    }
    render(){
        const {searchText,allTransactions}=this.state
        return(
           <View style={styles.container}>
             <View style={styles.upperContainer}>
                <View style={styles.textInputContainer}>
                <TextInput
                style={styles.textInput}
                onChangeText={(text)=>{this.setState({searchText:text})}}
                placeholder={'Search by Book ID or Student ID'}
                placeholderTextColor={'white'}
                />
            <TouchableOpacity style={styles.scanButton} onPress={()=>{this.handleSearch(searchText)}}>
                <Text style={styles.scanButtonText}>
                    Search
                </Text>
            </TouchableOpacity>
            </View>
             </View>
             <View style={styles.lowerContainer}>
            <FlatList
            //FlatList has 3 key properties (data, renderItem, and keyExtractor)
            //data contains all data froma array whose items need to be rendered
            //renderItem takes each item from data array one at a time and renders it as described in jsx function being called
            //(render item) most used for formatting
            //keyExtractor gives unique key propoerty to each item in array
            //similar to indexing but has to be string data type
            data={allTransactions}
            renderItem={this.renderItem}
            keyExtractor={
                (item,index)=>index.toString()
            }
            onEndReached={()=>{this.fetchMoreTransactions(searchText)}}
            onEndReachedThreshold={0.98}
            />
             </View>
           </View> 
        )
    }
}

const styles= StyleSheet.create({
    container:{
flex:1,
backgroundColor: 'green',
    },
    upperContainer:{
        flex:0.2,
        justifyContent:'center',
        alignItems:'center'
    },
    lowerContainer:{
        flex:0.8,
        backgroundColor:'white'
    },
    lowerLeftContainer:{
        alignSelf:'flex-end',
        marginTop: -50
    },
    date:{
        fontSize:15,
        fontFamily:'Rajdhani_600SemiBold',
        paddingTop:5
    },
    transactionContainer:{
        flexDirection:'row',
        justifyContent:'space-evenly',
        alignItems:'center'
    },
    transactionText:{
        fontSize:20,
        fontFamily:'Rajdhani_600SemiBold'
    },
    subtitle:{
        fontSize:15,
        fontFamily:'Rajdhani_600SemiBold'
    },
    title:{
        fontSize:20,
        fontFamily:'Rajdhani_600SemiBold'
    },
    scanButtonText:{
        fontSize:20,
        color:'white',
        fontFamily:'Rajdhani_600SemiBold'
    },
    scanButton:{
        width:70,
        height:50,
        backgroundColor:'#9DFD24',
        justifyContent:'center',
        alignItems:'center',
        borderTopRightRadius:10,
        borderBottomRightRadius:10
    },
    textInput:{
        width:'80%',
        height:50,
        borderColor:'white',
        borderRadius:10,
        borderWidth:3,
        fontSize:18,
        backgroundColor:'#5653D4',
        fontFamily:'Rajdhani_600SemiBold',
        color:'white'
    },
    textInputContainer:{
        width:300,
        borderWidth:2,
        borderRadius:10,
        flexDirection:'row',
        backgroundColor:'#9DFD24',
        borderColor:'white'
    }

})