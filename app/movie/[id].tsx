import { useLocalSearchParams } from 'expo-router'
import React from 'react'
import { Text, View } from 'react-native'

const Details = () => {
  const { id } = useLocalSearchParams()
  return (
    <View>
      <Text> {id} </Text>
    </View>
  )
}

export default Details

//const styles = StyleSheet.create({})