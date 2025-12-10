import { buttonStyle } from '@/constants/images';
import { useRef, useState } from 'react';
import { Text, View } from 'react-native';

export default function Counter() {
  //useRef returns an object with a single property, current
  let ref = useRef(0);
  const [count, setCount] = useState(0); 

  function handleClick() {
    ref.current = ref.current + 1;
    //setCount(count+1);
    console.log(`ref is now ${ref.current}`);
  }

  function handleCount() {
    setCount(count+1);
    console.log(`ref is now ${ref.current}`);
  }

  return (
    <View>
      <button style={buttonStyle} onClick={handleClick}>
        Update Ref
      </button>
      <button style={buttonStyle} onClick={handleCount}>
        Update Count
      </button>      
      <Text>
        current ref {ref.current}
      </Text>
      <Text>
        {count}
      </Text>
    </View>
  );
}
