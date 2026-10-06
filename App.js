import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

const CATEGORIES = [
  "All", "Breakfast", "Lunch", "Dinner", "Italian", "Indian",
  "Mexican", "Asian", "Dessert", "Salad", "Drinks", "Snacks", "My Food"
];

const STARTER = [
  {id:"1",name:"Masala Dosa",category:"Indian",image:"https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=900",ingredients:["Rice","Urad dal","Potato","Onion","Spices"],instructions:["Soak and grind rice and dal.","Prepare dosa batter and ferment.","Make potato filling.","Cook dosa and serve with filling."],time:"35 min",servings:"2",calories:"320",difficulty:"Medium"},
  {id:"2",name:"Margherita Pizza",category:"Italian",image:"https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=900",ingredients:["Pizza dough","Tomato","Mozzarella","Basil"],instructions:["Roll the dough.","Spread tomato sauce.","Add mozzarella and basil.","Bake until golden."],time:"30 min",servings:"2",calories:"540",difficulty:"Easy"},
  {id:"3",name:"Chicken Tacos",category:"Mexican",image:"https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=900",ingredients:["Tortillas","Chicken","Lettuce","Tomato","Cheese"],instructions:["Cook seasoned chicken.","Warm tortillas.","Add chicken and vegetables.","Serve with cheese."],time:"25 min",servings:"2",calories:"460",difficulty:"Easy"},
  {id:"4",name:"Pancakes",category:"Breakfast",image:"https://images.unsplash.com/photo-1528207776546-365bb710ee93?w=900",ingredients:["Flour","Milk","Egg","Sugar","Butter"],instructions:["Mix dry ingredients.","Add milk and egg.","Cook portions on a hot pan.","Serve with fruit."],time:"15 min",servings:"2",calories:"410",difficulty:"Easy"},
  {id:"5",name:"Caesar Salad",category:"Salad",image:"https://images.unsplash.com/photo-1546793665-c74683f339c1?w=900",ingredients:["Lettuce","Croutons","Parmesan","Dressing"],instructions:["Wash and chop lettuce.","Add croutons.","Toss with dressing.","Finish with parmesan."],time:"10 min",servings:"2",calories:"280",difficulty:"Easy"},
  {id:"6",name:"Chocolate Cake",category:"Dessert",image:"https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900",ingredients:["Flour","Cocoa","Sugar","Eggs","Butter"],instructions:["Mix dry ingredients.","Add wet ingredients.","Pour into a cake tin.","Bake and cool."],time:"50 min",servings:"6",calories:"430",difficulty:"Medium"},
  {id:"7",name:"Veggie Fried Rice",category:"Asian",image:"https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=900",ingredients:["Rice","Carrot","Peas","Soy sauce","Spring onion"],instructions:["Cook vegetables.","Add cooked rice.","Add soy sauce.","Stir fry and serve."],time:"20 min",servings:"2",calories:"390",difficulty:"Easy"},
  {id:"8",name:"Pasta Arrabbiata",category:"Italian",image:"https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=900",ingredients:["Pasta","Tomato","Garlic","Chili","Olive oil"],instructions:["Boil pasta.","Prepare spicy tomato sauce.","Combine pasta and sauce.","Serve hot."],time:"25 min",servings:"2",calories:"450",difficulty:"Easy"},
  {id:"9",name:"Fruit Smoothie",category:"Drinks",image:"https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=900",ingredients:["Banana","Strawberry","Milk","Honey"],instructions:["Add fruit to blender.","Add milk and honey.","Blend until smooth.","Serve chilled."],time:"5 min",servings:"1",calories:"220",difficulty:"Easy"},
  {id:"10",name:"Samosa",category:"Snacks",image:"https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900",ingredients:["Flour","Potato","Peas","Spices"],instructions:["Prepare dough.","Make spiced potato filling.","Shape samosas.","Fry until crisp."],time:"40 min",servings:"4",calories:"310",difficulty:"Medium"}
];

export default function App() {
  const [recipes,setRecipes] = useState(STARTER);
  const [favorites,setFavorites] = useState([]);
  const [category,setCategory] = useState("All");
  const [screen,setScreen] = useState("home");
  const [selected,setSelected] = useState(null);
  const [editing,setEditing] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("foodie_user_recipes");
        const fav = await AsyncStorage.getItem("foodie_favorites");
        if (saved) setRecipes([...STARTER,...JSON.parse(saved)]);
        if (fav) setFavorites(JSON.parse(fav));
      } finally { setLoading(false); }
    })();
  }, []);

  const saveData = async (nextRecipes=recipes,nextFav=favorites) => {
    const user = nextRecipes.filter(r => r.userCreated);
    await AsyncStorage.setItem("foodie_user_recipes",JSON.stringify(user));
    await AsyncStorage.setItem("foodie_favorites",JSON.stringify(nextFav));
  };

  const toggleFavorite = async id => {
    const next = favorites.includes(id) ? favorites.filter(x=>x!==id) : [...favorites,id];
    setFavorites(next); await saveData(recipes,next);
  };

  const openRecipe = r => { setSelected(r); setScreen("details"); };

  const filtered = category === "All" ? recipes :
    category === "My Food" ? recipes.filter(r=>r.userCreated) :
    recipes.filter(r=>r.category===category);

  const chooseCategory = c => {
    setCategory(c);
    if (c === "My Food") setScreen("myfood"); else setScreen("home");
  };

  const deleteRecipe = r => {
    Alert.alert("Delete Recipe",`Delete "${r.name}"?`,[
      {text:"Cancel",style:"cancel"},
      {text:"Delete",style:"destructive",onPress:async()=>{
        const next=recipes.filter(x=>x.id!==r.id);
        setRecipes(next); await saveData(next,favorites); setScreen("myfood");
      }}
    ]);
  };

  const startEdit = r => { setEditing(r); setScreen("form"); };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large"/><Text>Loading Foodie...</Text></View>;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content"/>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>Foodie</Text>
          <Text style={styles.subtitle}>{screen==="details" ? "Recipe details" : "Discover delicious recipes"}</Text>
        </View>
        {screen!=="home" && <Pressable onPress={()=>setScreen(screen==="form" ? (editing?"myfood":"myfood") : "home")} style={styles.back}><Text>‹ Back</Text></Pressable>}
      </View>

      {screen==="home" && <Home
        recipes={filtered} category={category} categories={CATEGORIES}
        favorites={favorites} chooseCategory={chooseCategory}
        onRecipe={openRecipe} onFavorite={toggleFavorite}
        onMyFood={()=>{setCategory("My Food");setScreen("myfood")}}
      />}

      {screen==="myfood" && <MyFood
        recipes={recipes.filter(r=>r.userCreated)}
        onAdd={()=>{setEditing(null);setScreen("form")}}
        onRecipe={openRecipe} onEdit={startEdit} onDelete={deleteRecipe}
      />}

      {screen==="details" && selected && <Details recipe={selected} favorite={favorites.includes(selected.id)} onFavorite={()=>toggleFavorite(selected.id)} onEdit={selected.userCreated?()=>startEdit(selected):null} onDelete={selected.userCreated?()=>deleteRecipe(selected):null}/>}

      {screen==="form" && <RecipeForm
        initial={editing} onCancel={()=>setScreen("myfood")}
        onSave={async r=>{
          const next = editing ? recipes.map(x=>x.id===editing.id?{...r,id:editing.id,userCreated:true}:x)
            : [...recipes,{...r,id:Date.now().toString(),userCreated:true}];
          setRecipes(next); await saveData(next,favorites); setEditing(null); setScreen("myfood");
        }}
      />}
    </SafeAreaView>
  );
}

function Home({recipes,category,categories,favorites,chooseCategory,onRecipe,onFavorite,onMyFood}) {
  const favRecipes=recipes.filter(r=>favorites.includes(r.id));
  return <ScrollView contentContainerStyle={styles.container}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
      {categories.map(c=><Pressable key={c} onPress={()=>chooseCategory(c)} style={[styles.chip,c===category&&styles.chipActive]}><Text style={[styles.chipText,c===category&&styles.chipTextActive]}>{c}</Text></Pressable>)}
    </ScrollView>
    <Text style={styles.section}>{category==="All"?"Popular Recipes":category}</Text>
    {recipes.length===0 ? <Empty text="No recipes in this category yet."/> :
      recipes.map(r=><RecipeCard key={r.id} recipe={r} favorite={favorites.includes(r.id)} onPress={()=>onRecipe(r)} onFavorite={()=>onFavorite(r.id)}/>)}
    <Text style={styles.section}>Favorites</Text>
    {favRecipes.length===0 ? <Empty text="Tap the heart on a recipe to add it here."/> :
      favRecipes.map(r=><RecipeCard key={"fav"+r.id} recipe={r} favorite onPress={()=>onRecipe(r)} onFavorite={()=>onFavorite(r.id)}/>)}
    <Pressable style={styles.myFoodButton} onPress={onMyFood}><Text style={styles.myFoodText}>🍴 My Food →</Text></Pressable>
  </ScrollView>;
}

function RecipeCard({recipe,favorite,onPress,onFavorite}) {
  return <Pressable style={styles.card} onPress={onPress}>
    <Image source={{uri:recipe.image}} style={styles.cardImage}/>
    <View style={styles.cardBody}>
      <View style={{flex:1}}><Text style={styles.cardTitle}>{recipe.name}</Text><Text style={styles.meta}>{recipe.category} • {recipe.time} • {recipe.difficulty}</Text></View>
      <Pressable onPress={onFavorite} hitSlop={10}><Text style={styles.heart}>{favorite?"♥":"♡"}</Text></Pressable>
    </View>
  </Pressable>;
}

function Details({recipe,favorite,onFavorite,onEdit,onDelete}) {
  return <ScrollView contentContainerStyle={styles.container}>
    <Image source={{uri:recipe.image}} style={styles.hero}/>
    <View style={styles.detailTitleRow}><Text style={styles.bigTitle}>{recipe.name}</Text><Pressable onPress={onFavorite}><Text style={styles.bigHeart}>{favorite?"♥":"♡"}</Text></Pressable></View>
    <Text style={styles.meta}>{recipe.category}</Text>
    <View style={styles.infoRow}>
      <Info label="Prep" value={recipe.time}/><Info label="Servings" value={recipe.servings}/><Info label="Calories" value={recipe.calories}/><Info label="Difficulty" value={recipe.difficulty}/>
    </View>
    <Text style={styles.section}>Ingredients</Text>
    {recipe.ingredients.map((x,i)=><Text key={i} style={styles.bullet}>• {x}</Text>)}
    <Text style={styles.section}>Instructions</Text>
    {recipe.instructions.map((x,i)=><View key={i} style={styles.step}><Text style={styles.stepNo}>{i+1}</Text><Text style={styles.stepText}>{x}</Text></View>)}
    {recipe.userCreated && <View style={styles.actions}><Pressable style={styles.secondary} onPress={onEdit}><Text>Edit Recipe</Text></Pressable><Pressable style={styles.danger} onPress={onDelete}><Text style={{color:"white"}}>Delete</Text></Pressable></View>}
  </ScrollView>;
}
function Info({label,value}) { return <View style={styles.info}><Text style={styles.infoValue}>{value}</Text><Text style={styles.infoLabel}>{label}</Text></View>; }

function MyFood({recipes,onAdd,onRecipe,onEdit,onDelete}) {
 return <ScrollView contentContainerStyle={styles.container}>
   <View style={styles.row}><View><Text style={styles.bigTitle}>My Recipes</Text><Text style={styles.meta}>Your personal recipes</Text></View><Pressable style={styles.primary} onPress={onAdd}><Text style={styles.primaryText}>+ Add New Recipe</Text></Pressable></View>
   {recipes.length===0?<Empty text="You have not added any recipes yet."/>:recipes.map(r=><View key={r.id} style={styles.myCard}><Pressable style={{flex:1}} onPress={()=>onRecipe(r)}><Text style={styles.cardTitle}>{r.name}</Text><Text style={styles.meta}>{r.category} • {r.time}</Text></Pressable><Pressable onPress={()=>onEdit(r)}><Text style={styles.link}>Edit</Text></Pressable><Pressable onPress={()=>onDelete(r)}><Text style={styles.deleteText}>Delete</Text></Pressable></View>)}
 </ScrollView>;
}

function RecipeForm({initial,onCancel,onSave}) {
 const [name,setName]=useState(initial?.name||"");
 const [image,setImage]=useState(initial?.image||"https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900");
 const [ingredients,setIngredients]=useState(initial?.ingredients?.join(", ")||"");
 const [instructions,setInstructions]=useState(initial?.instructions?.join("\n")||"");
 const [category,setCategory]=useState(initial?.category||"Indian");
 const [time,setTime]=useState(initial?.time||"30 min");
 const [servings,setServings]=useState(initial?.servings||"2");
 const [calories,setCalories]=useState(initial?.calories||"300");
 const [difficulty,setDifficulty]=useState(initial?.difficulty||"Easy");

 const pickImage=async()=>{
   const p=await ImagePicker.requestMediaLibraryPermissionsAsync();
   if(!p.granted){Alert.alert("Permission required","Please allow photo access.");return;}
   const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:["images"],quality:0.8});
   if(!result.canceled) setImage(result.assets[0].uri);
 };
 const save=()=>{
   if(!name.trim()||!ingredients.trim()||!instructions.trim()){Alert.alert("Missing information","Enter recipe name, ingredients and instructions.");return;}
   onSave({name:name.trim(),image,ingredients:ingredients.split(",").map(x=>x.trim()).filter(Boolean),instructions:instructions.split("\n").map(x=>x.trim()).filter(Boolean),category,time,servings,calories,difficulty});
 };
 return <ScrollView contentContainerStyle={styles.container}>
   <Text style={styles.bigTitle}>{initial?"Edit Recipe":"Add New Recipe"}</Text>
   <Text style={styles.label}>Recipe Name</Text><TextInput value={name} onChangeText={setName} placeholder="e.g. Paneer Tikka" style={styles.input}/>
   <Text style={styles.label}>Recipe Image</Text>
   <Image source={{uri:image}} style={styles.preview}/>
   <Pressable style={styles.secondary} onPress={pickImage}><Text>📷 Choose Image</Text></Pressable>
   <Text style={styles.label}>Category</Text><TextInput value={category} onChangeText={setCategory} placeholder="Indian" style={styles.input}/>
   <Text style={styles.label}>Ingredients (comma separated)</Text><TextInput value={ingredients} onChangeText={setIngredients} multiline style={[styles.input,styles.textarea]} placeholder="Paneer, spices, onion"/>
   <Text style={styles.label}>Step-by-step Instructions (one step per line)</Text><TextInput value={instructions} onChangeText={setInstructions} multiline style={[styles.input,styles.textarea]} placeholder={"Marinate paneer\\nCook on pan\\nServe hot"}/>
   <View style={styles.two}><TextInput value={time} onChangeText={setTime} style={[styles.input,styles.half]} placeholder="Prep time"/><TextInput value={servings} onChangeText={setServings} style={[styles.input,styles.half]} placeholder="Servings"/></View>
   <View style={styles.two}><TextInput value={calories} onChangeText={setCalories} style={[styles.input,styles.half]} placeholder="Calories"/><TextInput value={difficulty} onChangeText={setDifficulty} style={[styles.input,styles.half]} placeholder="Difficulty"/></View>
   <View style={styles.actions}><Pressable style={styles.secondary} onPress={onCancel}><Text>Cancel</Text></Pressable><Pressable style={styles.primary} onPress={save}><Text style={styles.primaryText}>Save Recipe</Text></Pressable></View>
 </ScrollView>;
}
function Empty({text}){return <View style={styles.empty}><Text style={styles.emptyText}>{text}</Text></View>}

const styles=StyleSheet.create({
 safe:{flex:1,backgroundColor:"#F7F8F5"},center:{flex:1,alignItems:"center",justifyContent:"center",gap:10,backgroundColor:"#F7F8F5"},
 header:{paddingHorizontal:18,paddingTop:14,paddingBottom:8,flexDirection:"row",justifyContent:"space-between",alignItems:"center",backgroundColor:"#F7F8F5"},
 brand:{fontSize:30,fontWeight:"800",color:"#1B5E20"},subtitle:{color:"#667060",marginTop:2},back:{padding:9,borderRadius:10,backgroundColor:"#E8F1E8"},
 container:{padding:16,paddingBottom:50},categories:{marginBottom:12},chip:{paddingHorizontal:14,paddingVertical:9,borderRadius:20,backgroundColor:"#E7EDE5",marginRight:8},chipActive:{backgroundColor:"#2E7D32"},chipText:{color:"#304030"},chipTextActive:{color:"white",fontWeight:"700"},
 section:{fontSize:21,fontWeight:"800",color:"#1F2A1F",marginTop:18,marginBottom:10},card:{backgroundColor:"white",borderRadius:16,marginBottom:14,overflow:"hidden",elevation:2},cardImage:{width:"100%",height:155},cardBody:{padding:13,flexDirection:"row",alignItems:"center"},cardTitle:{fontSize:18,fontWeight:"800",color:"#202820"},meta:{color:"#718071",marginTop:4},heart:{fontSize:32,color:"#D84315",paddingLeft:12},myFoodButton:{backgroundColor:"#1B5E20",padding:16,borderRadius:14,marginTop:18},myFoodText:{color:"white",fontWeight:"800",textAlign:"center",fontSize:16},
hero:{width:"100%",height:250,borderRadius:18},bigTitle:{fontSize:27,fontWeight:"800",color:"#1F2A1F",flex:1},detailTitleRow:{flexDirection:"row",alignItems:"center",marginTop:14},bigHeart:{fontSize:38,color:"#D84315"},infoRow:{flexDirection:"row",backgroundColor:"white",borderRadius:14,padding:12,marginTop:14,justifyContent:"space-between"},info:{alignItems:"center",flex:1},infoValue:{fontWeight:"800",color:"#2E7D32"},infoLabel:{fontSize:11,color:"#758075",marginTop:3},bullet:{fontSize:16,color:"#384338",marginVertical:4},step:{flexDirection:"row",marginBottom:12},stepNo:{backgroundColor:"#2E7D32",color:"white",width:27,height:27,borderRadius:14,textAlign:"center",paddingTop:5,fontWeight:"800",marginRight:10},stepText:{flex:1,fontSize:16,lineHeight:23,color:"#384338"},
actions:{flexDirection:"row",gap:10,marginTop:20,marginBottom:20},primary:{backgroundColor:"#2E7D32",paddingHorizontal:15,paddingVertical:12,borderRadius:11,alignItems:"center",justifyContent:"center"},primaryText:{color:"white",fontWeight:"800"},secondary:{borderWidth:1,borderColor:"#AAB8AA",paddingHorizontal:15,paddingVertical:12,borderRadius:11,alignItems:"center",justifyContent:"center",backgroundColor:"white"},danger:{backgroundColor:"#C62828",paddingHorizontal:15,paddingVertical:12,borderRadius:11,alignItems:"center"},row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginBottom:15},myCard:{backgroundColor:"white",padding:15,borderRadius:14,marginBottom:10,flexDirection:"row",alignItems:"center",gap:14},link:{color:"#2E7D32",fontWeight:"800"},deleteText:{color:"#C62828",fontWeight:"800"},
label:{fontWeight:"800",marginTop:13,marginBottom:6,color:"#344034"},input:{backgroundColor:"white",borderWidth:1,borderColor:"#D5DDD5",borderRadius:11,padding:12,fontSize:16},textarea:{minHeight:100,textAlignVertical:"top"},preview:{width:"100%",height:180,borderRadius:14,marginBottom:10},two:{flexDirection:"row",gap:10},half:{flex:1},empty:{padding:24,backgroundColor:"white",borderRadius:14,alignItems:"center"},emptyText:{color:"#748074",textAlign:"center"}
});
