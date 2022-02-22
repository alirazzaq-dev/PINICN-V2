const totalTokens = 1_000_000;
const initialReleaseInMin = 5;
const initialReleasePC = 50;

const cycles = 20
const eachCycleDuration = 5
const cycleNo = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]
const tokensInEachCycle = (totalTokens * (1 - initialReleasePC/100 ) ) / cycles
const currentCycleDuration = (_cycleNo) => initialReleaseInMin + eachCycleDuration*_cycleNo;

// Flow

console.log("============================")

console.log("Tokens locked: ", totalTokens)
console.log("Time passed in minutes: ", initialReleaseInMin)
console.log("After initial release : ", totalTokens * initialReleasePC / 100 )

console.log(" ")
let totalReleased = totalTokens * initialReleasePC / 100;
for(let i=1; i<=cycles; i++){
    console.log("Time passed in minutes: ", currentCycleDuration(i))
    console.log("tokens released in this cycle : ", tokensInEachCycle)
    totalReleased = totalReleased +  tokensInEachCycle
    console.log("totalReleased: ", totalReleased)
    console.log(" ")

}


