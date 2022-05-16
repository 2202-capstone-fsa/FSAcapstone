import Phaser from "phaser";
import { debugDraw } from "../utils/debug";
//import data from "../tiles/overworld.json";
import data from "../../public/tiles/overworld.json";
import {
  isItClose,
  setPlayer,
  movePlayer,
  overworldExits,
  overworldObjs,
  createAnims,
  interact,
  displayInventory,
  updateInventory,
} from "../utils/helper";

export default class Game extends Phaser.Scene {
  private parry!: "string";
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private player!: Phaser.Physics.Arcade.Sprite;
  private message!: Phaser.GameObjects.Text;

  constructor() {
    super("game");
  }

  preload() {
    //Load graphics
    this.load.image("houses", "tiles/overworld/houses.png");
    this.load.image("outside", "tiles/overworld/outside.png");
    this.load.image("jungle", "tiles/overworld/jungle.png");
    this.load.image("beach", "tiles/overworld/beach.png");
    this.load.image("clouds", "tiles/overworld/clouds.png");

    //Load audio
    this.load.audio("music", ["music/2.mp3"]);
    this.load.audio("item", ["music/item.mp3"]);

    //Load data (collisions, etc) for the map.
    this.load.tilemapTiledJSON("overworld", "tiles/overworld.json");

    //Load keyboard for player to use.
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    //Create tile sets so that we can access Tiled data later on.
    const map = this.make.tilemap({ key: "overworld" });
    const townTileSet = map.addTilesetImage("Town", "outside");
    const houseTileSet = map.addTilesetImage("Houses", "houses");
    const jungleTileSet = map.addTilesetImage("Jungle", "jungle");
    const beachTileSet = map.addTilesetImage("Beach", "beach");
    const cloudsTileSet = map.addTilesetImage("Clouds", "clouds");
    const allTileSet = [
      houseTileSet,
      townTileSet,
      beachTileSet,
      jungleTileSet,
      cloudsTileSet,
    ];

    //Create ground layer first using tile set data.
    // const overworld = map.addTilesetImage("overworld", "Ground");
    const groundLayer = map.createLayer("Ground", allTileSet);
    /* Add Player sprite to the game.
      In the sprite json file, for any png of sprites,
      the first set of sprites is called "green"
      the second set is called "teal"
      the third set is called "brown"
      and the fourth set is called "doc"
    */
    //map.create
    this.player = this.physics.add.sprite(
      800,
      800,
      "player",
      "doc-walk-down-0"
    );

    setPlayer(this.player);

    //adds and configs music

    let music = this.sound.add("music");
    let musicConfig = {
      mute: false,
      volume: 0.5,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: true,
      delay: 0,
    };
    music.play(musicConfig);
    let item = this.sound.add("item");

    //Create animations
    createAnims(this.anims);

    //Create houses and walls in this world, over the Ground and Player.
    const housesLayer = map.createLayer("Houses", allTileSet);
    const waterfallLayer = map.createLayer("Waterfall", allTileSet);
    const wallsLayer = map.createLayer("Walls", allTileSet);

    // this.cameras.main.startFollow(this.player, true);
    // this.cameras.main.setBounds(0, 0, 1600, 1600);
    // this.cameras.main.centerOn(600, 600);
    //Set walls and houses to collide with Player.
    wallsLayer.setCollisionByProperty({ collides: true });
    housesLayer.setCollisionByProperty({ collides: true });
    waterfallLayer.setCollisionByProperty({ collides: true });
    this.physics.add.collider(this.player, wallsLayer);
    this.physics.add.collider(this.player, housesLayer);
    this.physics.add.collider(this.player, waterfallLayer);

    this.message = this.add.text(800, 750, "", {
      color: "white",
      backgroundColor: "black",
      fontSize: "12px",
      align: "center",
      baselineX: 0,
      baselineY: 0,
      wordWrap: { width: 250 },
    });

    // Hit spacebar to interact with objects.
    this.cursors.space.on("down", () => {
      //console.log(data);
      interact(this.message, this.player, [], item);
    }),
      // Hit shift to view Inventory.
      this.cursors.shift.on("down", () => {
        displayInventory(this.message, this.player);
      }),
      debugDraw(wallsLayer, this);
  }
  update(t: number, dt: number) {
    if (!this.cursors || !this.player) {
      return;
    }

    // Enter a scene when near
    let nextToTarget = isItClose(this.player, overworldExits);
    if (nextToTarget) {
      this.scene.start(nextToTarget.name);
    }

    // Camera that follows
    this.cameras.main.scrollX = this.player.x - 400;
    this.cameras.main.scrollY = this.player.y - 300;

    // movement
    let speed = this.message.text ? 0 : 120;
    movePlayer(this.player, speed, this.cursors);
  }
}
