module Main exposing (..)

import Color exposing (..)
import Collage exposing (..)
import Element exposing (..)
import Html exposing (..)
import Html.App as App
import Keyboard.Extra
import Random
import AnimationFrame
import Time exposing (Time)


-- MODEL


type alias Model =
    { player : Player
    , map : Map
    , keyboardModel : Keyboard.Extra.Model
    }


type alias Player =
    { x : Float
    , y : Float
    , speed : Float
    }


type alias Map =
    { width : Float
    , height : Float
    , tiles : List (List Tile)
    }


type Tile
    = WaterTile
    | GrassTile


type Msg
    = KeyboardExtraMsg Keyboard.Extra.Msg
    | Tick Time
    | LoadMap (List (List Tile))


tileWidth : Float
tileWidth =
    32


tileHeight : Float
tileHeight =
    32


playerWidth : Float
playerWidth =
    32


playerHeight : Float
playerHeight =
    48


init : ( Model, Cmd Msg )
init =
    let
        ( keyboardModel, keyboardCmd ) =
            Keyboard.Extra.init

        mapWidth =
            100

        mapHeight =
            100

        initialPlayerX =
            0.0

        initialPlayerY =
            0.0

        initialPlayerSpeed =
            2.0
    in
        ( { player = Player initialPlayerX initialPlayerY initialPlayerSpeed
          , map = Map mapWidth mapHeight []
          , keyboardModel = keyboardModel
          }
        , Cmd.batch
            [ Cmd.map KeyboardExtraMsg keyboardCmd
            , Random.generate LoadMap <| mapGenerator mapWidth mapHeight
            ]
        )


mapGenerator : Int -> Int -> Random.Generator (List (List Tile))
mapGenerator width height =
    Random.list height <| Random.list width tileGenerator


tileGenerator : Random.Generator Tile
tileGenerator =
    Random.map mapIntToTile (Random.int 0 1)


mapIntToTile : Int -> Tile
mapIntToTile n =
    case n of
        0 ->
            WaterTile

        _ ->
            GrassTile



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        KeyboardExtraMsg keyMsg ->
            let
                ( keyboardModel, keyboardCmd ) =
                    Keyboard.Extra.update keyMsg model.keyboardModel
            in
                ( { model | keyboardModel = keyboardModel }
                , Cmd.map KeyboardExtraMsg keyboardCmd
                )

        Tick _ ->
            let
                { x, y } =
                    Keyboard.Extra.arrows model.keyboardModel

                oldPlayer =
                    model.player

                newPlayer =
                    { oldPlayer | x = oldPlayer.x + ((toFloat x) * oldPlayer.speed), y = oldPlayer.y + ((toFloat y) * oldPlayer.speed) }
            in
                { model | player = newPlayer } ! []

        LoadMap tileList ->
            let
                oldMap =
                    model.map

                newMap =
                    { oldMap | tiles = tileList }
            in
                { model | map = newMap } ! []



-- VIEW


view : Model -> Html Msg
view model =
    collage 500
        400
        [ drawMap model.map ( model.player.x, model.player.y )
        , drawPlayer model.player
        , filled white (rect 2 2)
        ]
        |> Element.toHtml


drawPlayer : Player -> Form
drawPlayer player =
    filled (Color.rgb 0 255 255) (rect playerWidth playerHeight)


drawMap : Map -> ( Float, Float ) -> Form
drawMap map ( x, y ) =
    let
        moveMapX =
            x

        moveMapY =
            y - (map.height * tileHeight) + playerHeight
    in
        move ( moveMapX, moveMapY ) (group (List.indexedMap drawMapRow map.tiles))


drawMapRow : Int -> List Tile -> Form
drawMapRow y row =
    moveY (toFloat y * tileHeight) (group (List.indexedMap drawMapTile row))


drawMapTile : Int -> Tile -> Form
drawMapTile x tile =
    case tile of
        WaterTile ->
            moveX (toFloat x * tileWidth) (filled (Color.rgb 0 0 255) (rect tileWidth tileHeight))

        GrassTile ->
            moveX (toFloat x * tileWidth) (filled (Color.rgb 0 255 0) (rect tileWidth tileHeight))



-- SUBSCRIPTIONS


subscriptions : Model -> Sub Msg
subscriptions model =
    Sub.batch
        [ Sub.map KeyboardExtraMsg Keyboard.Extra.subscriptions
        , AnimationFrame.diffs Tick
        ]



-- MAIN


main : Program Never
main =
    App.program
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
