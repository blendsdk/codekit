import { generateInterface } from "../TypeBuilder";
import * as fs from "fs";

test('simple type',()=>{
    const result = generateInterface("TestInterface",[
        {
            name:"prop1",
            type:"string",
            description:"This is property1"
        },
        {
            name:"prop2",
            type:"string",
            array:true            
        },
        {
            name:"prop3",
            type:"string",
            optional:true
        },
        {
            name:"prop4",
            type:"number",
            optional:true,
            array:true
        },
    ]);    
    const check =  fs.readFileSync("specs/type.test.txt").toString();
    expect(result).toEqual(check);
})